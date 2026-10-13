import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdminClient } from '../lib/supabase.js';

// Configuration
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]);

export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.docx',
  '.doc',
  '.txt',
]);

const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), 'storage', 'attachments');

// Ensure local directory exists for private storage
function ensureLocalStorageDir(): void {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
}

/**
 * Validates file size, extension, and MIME type against the strict allowlist.
 */
export function validateAttachment(
  fileSize: number,
  originalFilename: string,
  mimetype: string
): { valid: boolean; error?: string } {
  if (!fileSize || fileSize <= 0) {
    return { valid: false, error: 'File is empty (0 bytes).' };
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10 MB limit (${(fileSize / (1024 * 1024)).toFixed(2)} MB uploaded).`,
    };
  }

  const ext = path.extname(originalFilename || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' is not permitted. Allowed: PDF, PNG, JPEG, WEBP, DOCX, TXT.`,
    };
  }

  const cleanMime = (mimetype || '').toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
    return {
      valid: false,
      error: `MIME type '${mimetype}' is not permitted. Allowed: PDF, PNG, JPEG, WEBP, DOCX, TXT.`,
    };
  }

  return { valid: true };
}

/**
 * Sanitizes user-provided filename to prevent path traversal or special characters.
 */
export function sanitizeFilename(filename: string): string {
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._\- ]/g, '_').slice(0, 180);
}

/**
 * Uploads attachment to private Supabase Storage or private local storage.
 * Returns unique random storageKey.
 */
export async function uploadAttachment(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  conversationId: string
): Promise<{ storageKey: string; fileSize: number }> {
  const sanitized = sanitizeFilename(originalFilename);
  const ext = path.extname(sanitized).toLowerCase();
  const uniqueId = crypto.randomUUID();
  const storageKey = `conv_${conversationId}/${uniqueId}${ext}`;

  const supabase = getSupabaseAdminClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('conversation-attachments')
        .upload(storageKey, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (!error && data?.path) {
        return {
          storageKey: data.path,
          fileSize: buffer.length,
        };
      }
    } catch (err) {
      console.warn('[STORAGE] Supabase Storage upload fallback to local storage:', err);
    }
  }

  // Fallback to private local storage
  ensureLocalStorageDir();
  const localTarget = path.join(LOCAL_STORAGE_DIR, storageKey);
  const targetDir = path.dirname(localTarget);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(localTarget, buffer);

  return {
    storageKey,
    fileSize: buffer.length,
  };
}

/**
 * Retrieves file stream or short-lived signed URL for an authorized attachment download.
 */
export async function getAttachmentResource(
  storageKey: string
): Promise<{ signedUrl?: string; localPath?: string; mimeType?: string }> {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('conversation-attachments')
        .createSignedUrl(storageKey, 300); // 5-minute signed URL

      if (!error && data?.signedUrl) {
        return { signedUrl: data.signedUrl };
      }
    } catch {
      // Fall through to local check
    }
  }

  // Local storage resolution
  const localTarget = path.join(LOCAL_STORAGE_DIR, storageKey);
  // Prevent path traversal
  const normalized = path.normalize(localTarget);
  if (!normalized.startsWith(LOCAL_STORAGE_DIR)) {
    throw new Error('Access denied: Invalid storage key path traversal.');
  }

  if (fs.existsSync(normalized)) {
    return { localPath: normalized };
  }

  throw new Error('Attachment file not found on storage server.');
}

/**
 * Removes an orphaned storage file if database transaction fails.
 */
export async function deleteAttachmentFile(storageKey: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      await supabase.storage.from('conversation-attachments').remove([storageKey]);
    } catch {
      // ignore
    }
  }

  try {
    const localTarget = path.join(LOCAL_STORAGE_DIR, storageKey);
    const normalized = path.normalize(localTarget);
    if (normalized.startsWith(LOCAL_STORAGE_DIR) && fs.existsSync(normalized)) {
      fs.unlinkSync(normalized);
    }
  } catch {
    // ignore
  }
}
