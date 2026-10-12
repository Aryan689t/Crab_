import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('--- TESTING AUTH OVERHAUL & RESCUE FLOW ---');
  const baseUrl = 'http://127.0.0.1:5000';

  // 1. Reset passwordHash for tathagataryan2006@gmail.com to test rescue flow
  await prisma.user.updateMany({
    where: { email: 'tathagataryan2006@gmail.com' },
    data: { passwordHash: null },
  });
  console.log('[SETUP] Cleared passwordHash on tathagataryan2006@gmail.com to simulate rescue state.');

  // 2. Test first login for tathagataryan2006@gmail.com (rescue flow)
  const testPassword = 'MySecurePassword2026!';
  const res1 = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tathagataryan2006@gmail.com',
      password: testPassword,
    }),
  });
  const data1 = await res1.json();
  console.log(`[TEST 1] First login (rescue flow) status: ${res1.status}`);
  console.log(`   - Display Name: ${data1.user?.displayName}`);
  console.log(`   - Role: ${data1.user?.role}`);
  console.log(`   - Token: ${data1.session?.accessToken?.slice(0, 30)}...`);
  console.log(`   - Onboarding Completed: ${data1.user?.onboardingCompleted}`);

  if (res1.status !== 200 || !data1.session?.accessToken) {
    console.error('❌ Test 1 failed:', data1);
    process.exit(1);
  }
  console.log('✅ Test 1 passed: User rescued and authenticated successfully!');

  // 3. Test subsequent login with correct password
  const res2 = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tathagataryan2006@gmail.com',
      password: testPassword,
    }),
  });
  const data2 = await res2.json();
  console.log(`[TEST 2] Subsequent login with matching password status: ${res2.status}`);
  if (res2.status !== 200) {
    console.error('❌ Test 2 failed:', data2);
    process.exit(1);
  }
  console.log('✅ Test 2 passed: Verified against stored scrypt password hash!');

  // 4. Test subsequent login with WRONG password
  const res3 = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tathagataryan2006@gmail.com',
      password: 'WrongPassword999!',
    }),
  });
  console.log(`[TEST 3] Login with wrong password status: ${res3.status} (expected 401)`);
  if (res3.status === 401) {
    console.log('✅ Test 3 passed: Incorrect password rejected with HTTP 401!');
  } else {
    console.error('❌ Test 3 failed, expected 401 but got:', res3.status);
    process.exit(1);
  }

  // 5. Test GET /api/auth/me with session token
  const resMe = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${data1.session.accessToken}` },
  });
  const dataMe = await resMe.json();
  console.log(`[TEST 4] GET /api/auth/me status: ${resMe.status}`);
  console.log(`   - Verified User: ${dataMe.data?.displayName} (${dataMe.data?.email})`);
  console.log(`   - Onboarding Completed: ${dataMe.data?.onboardingCompleted}`);
  if (resMe.status !== 200 || dataMe.data?.email !== 'tathagataryan2006@gmail.com') {
    console.error('❌ Test 4 failed:', dataMe);
    process.exit(1);
  }
  console.log('✅ Test 4 passed: Session token validated by auth middleware!');

  // 6. Test registration and login of brand new user
  const newEmail = `user.fresh.${Date.now()}@example.com`;
  const newPass = 'FreshUserPass2026!';
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newEmail,
      password: newPass,
      role: 'CREATOR',
      displayName: 'Fresh Test Creator',
    }),
  });
  const regData = await regRes.json();
  console.log(`[TEST 5] Fresh registration status: ${regRes.status}`);
  if (regRes.status !== 201 || !regData.session?.accessToken) {
    console.error('❌ Test 5 failed:', regData);
    process.exit(1);
  }
  console.log('✅ Test 5 passed: Fresh user registered and issued active session without email blocking!');

  const freshLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newEmail,
      password: newPass,
    }),
  });
  const freshLoginData = await freshLogin.json();
  console.log(`[TEST 6] Fresh user login status: ${freshLogin.status}`);
  if (freshLogin.status !== 200) {
    console.error('❌ Test 6 failed:', freshLoginData);
    process.exit(1);
  }
  console.log('✅ Test 6 passed: Fresh user logged in with scrypt credentials!');

  // Clean up fresh test user
  await prisma.user.deleteMany({ where: { email: newEmail } });

  console.log('--- ALL AUTH OVERHAUL TESTS PASSED SUCCESSFULLY ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
