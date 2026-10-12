const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    database: string;
    pgvector: string;
    supabaseAuth: string;
    geminiAi: string;
    razorpay: string;
  };
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

// -------------------------------------------------------------
// Client-Side In-Memory Cache & In-Flight Request Deduplication
// -------------------------------------------------------------
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL for safe idempotent GET queries
const apiCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Builds a scoped cache key distinguishing endpoint and user/session token.
 */
function getCacheKey(endpoint: string, token?: string): string {
  const userScope = token ? token.slice(-16) : 'anonymous';
  return `${userScope}::${endpoint}`;
}

/**
 * Clears in-memory API cache completely (e.g. on logout or user switch)
 * or invalidates matching endpoint prefixes (e.g. after a mutation).
 */
export function invalidateApiCache(endpointPrefix?: string): void {
  if (!endpointPrefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(endpointPrefix)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Performs HTTP request with in-flight deduplication and 30s in-memory caching for GET requests.
 * Mutating requests (POST, PATCH, PUT, DELETE) or sensitive auth endpoints are never cached.
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const isCacheable = isGet && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register');

  const cacheKey = getCacheKey(endpoint, token);
  const now = Date.now();

  // 1. Serve valid cached entry for GET requests
  if (isCacheable) {
    const cached = apiCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  // 2. In-flight request deduplication for identical concurrent GET calls
  if (isCacheable && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const executeRequest = async (): Promise<T> => {
    try {
      // 3.5-second abort signal to prevent hanging requests on network delay
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Store in cache if cacheable
      if (isCacheable) {
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      // If this was a mutation (POST, PATCH, PUT, DELETE), invalidate related cache entries
      if (!isGet) {
        if (endpoint.includes('/creators/')) invalidateApiCache('/creators');
        if (endpoint.includes('/brands/')) invalidateApiCache('/brands');
        if (endpoint.includes('/social/')) invalidateApiCache('/social');
        if (endpoint.includes('/applications') || endpoint.includes('/application')) {
          invalidateApiCache('/applications');
          invalidateApiCache('/application');
          invalidateApiCache('/creators/me/applications');
          invalidateApiCache('/brands/me/applications');
          invalidateApiCache('/campaigns');
        }
        if (endpoint.includes('/campaigns/')) {
          invalidateApiCache('/campaigns');
          invalidateApiCache('/creators/me/applications');
          invalidateApiCache('/brands/me/applications');
        }
      }

      return data as T;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  };

  const requestPromise = executeRequest();
  if (isCacheable) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}
