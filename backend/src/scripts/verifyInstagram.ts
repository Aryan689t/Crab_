import {
  parseInstagramInput,
  generateInstagramAuthUrl,
  validateInstagramOAuthState,
} from '../integrations/instagram/index.js';
import { config } from '../config/env.js';

async function runInstagramVerification() {
  console.log('====================================================');
  console.log('CRAB — Instagram Integration Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  }

  // 1. Handle Parsing & URL Normalization
  console.log('--- 1. Testing Input Parsing & Handle Normalization ---');
  const res1 = parseInstagramInput('@techguy');
  assert(res1.username === 'techguy', 'Handles leading @ symbol', `Expected "techguy", got "${res1.username}"`);

  const res2 = parseInstagramInput('https://instagram.com/natgeo/');
  assert(res2.username === 'natgeo', 'Extracts handle from clean Instagram URL', `Expected "natgeo", got "${res2.username}"`);

  const res3 = parseInstagramInput('https://www.instagram.com/cristiano/?hl=en&utm_source=crab');
  assert(res3.username === 'cristiano', 'Strips query parameters and trailing slashes', `Expected "cristiano", got "${res3.username}"`);

  const res4 = parseInstagramInput('just_a_username');
  assert(res4.username === 'just_a_username', 'Accepts standard username directly', `Expected "just_a_username", got "${res4.username}"`);
  assert(res4.normalizedUrl === 'https://www.instagram.com/just_a_username', 'Normalizes canonical profile URL');

  // 2. Set test credentials if not configured in environment for test run
  if (!config.instagram.appId) {
    config.instagram.appId = 'test_meta_app_id_98765';
    config.instagram.appSecret = 'test_meta_app_secret_12345';
  }

  // 3. CSRF State Generation and Validation
  console.log('\n--- 2. Testing Cryptographic OAuth CSRF State Flow ---');
  const testCreatorId = 'creator_test_id_12345';
  const authRes = generateInstagramAuthUrl(testCreatorId);
  const stateToken = authRes.state;
  assert(typeof stateToken === 'string' && stateToken.length > 20, 'Generates high-entropy cryptographic state');

  const validation = validateInstagramOAuthState(stateToken);
  assert(validation.valid && validation.creatorId === testCreatorId, 'Validates state and retrieves correct creatorId');

  const replayed = validateInstagramOAuthState(stateToken);
  assert(!replayed.valid, 'Enforces single-use state tokens (replay attack prevention)');

  const tampered = validateInstagramOAuthState('invalid_tampered_state_token');
  assert(!tampered.valid, 'Rejects invalid or tampered state token');

  // 4. OAuth URL Construction
  console.log('\n--- 3. Testing OAuth Authorization URL Construction ---');
  const authUrl = new URL(authRes.authUrl);
  assert(authUrl.origin === 'https://www.instagram.com', 'Points to official Meta Instagram OAuth host');
  assert(authUrl.pathname === '/oauth/authorize', 'Uses /oauth/authorize endpoint');
  assert(authUrl.searchParams.get('response_type') === 'code', 'Requests response_type=code');
  assert(authUrl.searchParams.get('scope') === 'instagram_business_basic', 'Requests official instagram_business_basic scope');
  assert(authUrl.searchParams.get('client_id') === config.instagram.appId, 'Embeds registered Meta App ID');
  assert(authUrl.searchParams.get('state') === stateToken, 'Embeds single-use cryptographic state token');

  console.log('\n====================================================');
  console.log(`Verification Complete: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runInstagramVerification().catch((err) => {
  console.error('Unexpected error during verification:', err);
  process.exit(1);
});
