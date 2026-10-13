import http from 'http';
import app from '../index.js';
import { prisma } from '../lib/prisma.js';

let server: http.Server;
const PORT = 5003;
const BASE_URL = `http://localhost:${PORT}`;

async function startServer(): Promise<void> {
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      resolve();
    });
  });
}

async function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

async function request(
  endpoint: string,
  options: {
    method?: string;
    token?: string;
    body?: any;
  } = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, data: json };
}

async function runRealMessagingVerification() {
  console.log('===============================================================');
  console.log('🧪 CRAB End-to-End Real Messaging & Authorization Test Suite');
  console.log('===============================================================\n');

  await startServer();

  try {
    // 1. Identify two distinct test identities in PostgreSQL:
    // Identity A: Creator Alex Chen (demo_user_creator_01)
    // Identity B: Brand AWS (demo_user_brand_01)
    // Identity C: Unauthorized Creator Priya (demo_user_creator_02)
    const creator = await prisma.creator.findFirst({
      include: { user: true },
    });
    const brand = await prisma.brand.findFirst({
      include: { user: true },
    });

    if (!creator || !brand) {
      throw new Error('Database missing creator or brand test records.');
    }

    console.log(`👤 Creator Participant: ${creator.displayName} (User ID: ${creator.userId})`);
    console.log(`🏢 Brand Participant: ${brand.name} (User ID: ${brand.userId})`);

    const creatorToken = `mock-${creator.userId}-creator`;
    const brandToken = `mock-${brand.userId}-brand`;
    const unauthorizedCreatorToken = 'mock-demo_user_creator_02-creator';

    // --- CHECK 1: Listing conversations returns authentic database state ---
    console.log('\n--- Check 1: List conversations returns genuine DB array ---');
    const listRes = await request('/api/conversations', { token: creatorToken });
    if (listRes.status !== 200 || !Array.isArray(listRes.data?.data)) {
      throw new Error(`Failed to list conversations: status ${listRes.status}`);
    }
    console.log(`✅ PASS: Listed ${listRes.data.data.length} real conversations from PostgreSQL.`);
    for (const c of listRes.data.data) {
      if (c.id === 'conv_1' || c.id === 'conv_2') {
        throw new Error('Leaked hardcoded demo conversation into backend API response!');
      }
    }
    console.log('✅ PASS: Verified zero demo/mock conversation IDs present.');

    // --- CHECK 2: Brand initiates real conversation with Creator ---
    console.log('\n--- Check 2: Brand initiates real conversation ---');
    const initRes = await request('/api/conversations/initiate', {
      method: 'POST',
      token: brandToken,
      body: {
        creatorId: creator.id,
        initialMessage: 'Hello! We are initiating this live verification thread.',
      },
    });

    if (initRes.status !== 200 || !initRes.data?.data?.id) {
      throw new Error(`Brand initiate conversation failed: ${JSON.stringify(initRes.data)}`);
    }
    const convId = initRes.data.data.id;
    console.log(`✅ PASS: Conversation created/retrieved in PostgreSQL with ID: ${convId}`);

    // --- CHECK 3: Idempotency (prevent duplicate conversations) ---
    console.log('\n--- Check 3: Idempotent initiation prevents duplicate threads ---');
    const initAgainRes = await request('/api/conversations/initiate', {
      method: 'POST',
      token: brandToken,
      body: {
        creatorId: creator.id,
      },
    });
    if (initAgainRes.data?.data?.id !== convId) {
      throw new Error('Initiate conversation created a duplicate record instead of returning existing one!');
    }
    console.log('✅ PASS: Repeated initiation safely reused existing conversation.');

    // --- CHECK 4: Authorization enforcement (Unauthorized user blocked) ---
    console.log('\n--- Check 4: Third-party unauthorized creator is blocked (403) ---');
    const unauthRead = await request(`/api/conversations/${convId}`, {
      token: unauthorizedCreatorToken,
    });
    if (unauthRead.status !== 403) {
      throw new Error(`Expected 403 Forbidden on read, got ${unauthRead.status}`);
    }

    const unauthSend = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: unauthorizedCreatorToken,
      body: { messageText: 'Illegal intrusive message' },
    });
    if (unauthSend.status !== 403) {
      throw new Error(`Expected 403 Forbidden on write, got ${unauthSend.status}`);
    }
    console.log('✅ PASS: Strict multi-tenant security blocked unauthorized reads & sends.');

    // --- CHECK 5: Message validation (empty and overly long messages rejected) ---
    console.log('\n--- Check 5: Message validation prevents empty or excessive payloads ---');
    const emptySend = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: brandToken,
      body: { messageText: '   ' },
    });
    if (emptySend.status !== 400) {
      throw new Error(`Expected 400 Bad Request for whitespace message, got ${emptySend.status}`);
    }

    const hugeSend = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: brandToken,
      body: { messageText: 'x'.repeat(6000) },
    });
    if (hugeSend.status !== 400) {
      throw new Error(`Expected 400 Bad Request for 6000-char message, got ${hugeSend.status}`);
    }
    console.log('✅ PASS: Input validation correctly rejected empty and oversized messages.');

    // --- CHECK 6: Brand sends authentic message to Creator ---
    console.log('\n--- Check 6: Brand sends authentic message to Creator ---');
    const testMsgText = `Live message timestamp ${Date.now()}: Looking forward to your developer review video!`;
    const sendRes = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: brandToken,
      body: { messageText: testMsgText },
    });
    if (sendRes.status !== 201 || !sendRes.data?.data?.id) {
      throw new Error(`Brand send message failed: ${JSON.stringify(sendRes.data)}`);
    }
    const messageId = sendRes.data.data.id;
    console.log(`✅ PASS: Brand message persisted in PostgreSQL with ID: ${messageId}`);

    // --- CHECK 7: Creator retrieves conversation and receives Brand message ---
    console.log('\n--- Check 7: Creator receives Brand message via thread history ---');
    const creatorThreadRes = await request(`/api/conversations/${convId}`, {
      token: creatorToken,
    });
    if (creatorThreadRes.status !== 200 || !creatorThreadRes.data?.data?.messages) {
      throw new Error(`Creator get conversation failed: ${JSON.stringify(creatorThreadRes.data)}`);
    }
    const threadMsgs = creatorThreadRes.data.data.messages;
    const foundMsg = threadMsgs.find((m: any) => m.id === messageId);
    if (!foundMsg || foundMsg.messageText !== testMsgText) {
      throw new Error('Persisted Brand message not found in Creator thread history!');
    }
    console.log(`✅ PASS: Creator successfully received Brand message (${threadMsgs.length} total messages).`);

    // --- CHECK 8: Read tracking & unread count reset ---
    console.log('\n--- Check 8: Read tracking marks incoming messages as read ---');
    const readRes = await request(`/api/conversations/${convId}/read`, {
      method: 'POST',
      token: creatorToken,
    });
    if (readRes.status !== 200) {
      throw new Error(`Mark as read failed: ${JSON.stringify(readRes.data)}`);
    }

    const dbMsg = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!dbMsg?.readAt) {
      throw new Error('Message readAt timestamp was not updated in PostgreSQL!');
    }
    console.log(`✅ PASS: Message readAt timestamp successfully recorded: ${dbMsg.readAt.toISOString()}`);

    // --- CHECK 9: Creator sends reply to Brand ---
    console.log('\n--- Check 9: Creator replies to Brand ---');
    const replyText = `Thanks for the details! I will begin script drafting immediately.`;
    const replyRes = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: creatorToken,
      body: { messageText: replyText },
    });
    if (replyRes.status !== 201 || !replyRes.data?.data?.id) {
      throw new Error(`Creator reply failed: ${JSON.stringify(replyRes.data)}`);
    }
    console.log(`✅ PASS: Creator reply persisted in PostgreSQL.`);

    // --- CHECK 10: Brand retrieves conversation and sees Creator reply ---
    console.log('\n--- Check 10: Brand receives Creator reply ---');
    const brandThreadRes = await request(`/api/conversations/${convId}`, {
      token: brandToken,
    });
    const brandMessages = brandThreadRes.data.data.messages;
    const foundReply = brandMessages.find((m: any) => m.messageText === replyText);
    if (!foundReply) {
      throw new Error('Creator reply not found in Brand thread!');
    }
    console.log(`✅ PASS: Two-way authenticated exchange verified (${brandMessages.length} total messages in thread).`);

    console.log('\n===============================================================');
    console.log('🎉 ALL 10 REAL-TIME MESSAGING & SECURITY CHECKS PASSED!');
    console.log('===============================================================\n');
  } finally {
    await stopServer();
    await prisma.$disconnect();
  }
}

runRealMessagingVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
