import http from 'http';
import app from '../index.js';
import { prisma } from '../lib/prisma.js';

let server: http.Server;
const PORT = 5002;
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

async function runTests() {
  console.log('==================================================');
  console.log('🧪 CRAB Accept Invitation & Messaging Test Suite');
  console.log('==================================================\n');

  await startServer();

  try {
    const creatorToken = 'mock-demo_user_creator_01-creator';
    const brandToken = 'mock-demo_user_brand_01-brand';
    const priyaToken = 'mock-demo_user_creator_02-creator';

    console.log('✅ Auth tokens initialized.');

    // Test 1: Accept invitation as Creator
    console.log('\n--- Test 1: Accept invitation from Requests page ---');
    const acceptRes = await request('/api/requests/req_1/accept', {
      method: 'POST',
      token: creatorToken,
      body: {
        snippet: 'Hi Alex, we reviewed your recent cloud architecture videos and would love to partner on an educational developer series.',
      },
    });
    if (acceptRes.status !== 200 || !acceptRes.data?.data?.conversationId) {
      throw new Error(`Accept invitation failed: ${JSON.stringify(acceptRes.data)}`);
    }
    const conversationId = acceptRes.data.data.conversationId;
    console.log(`✅ PASS: Invitation accepted. Conversation ID created: ${conversationId}`);

    // Verify in DB directly
    const dbConv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });
    if (!dbConv) {
      throw new Error('Conversation was not saved in PostgreSQL database!');
    }
    console.log(`✅ PASS: Conversation verified in PostgreSQL with ${dbConv.messages.length} initial message(s).`);

    // Test 2: Idempotent acceptance (duplicate prevention)
    console.log('\n--- Test 2: Duplicate acceptance returns same conversation without duplicates ---');
    const acceptAgainRes = await request('/api/requests/req_1/accept', {
      method: 'POST',
      token: creatorToken,
    });
    if (acceptAgainRes.data?.data?.conversationId !== conversationId) {
      throw new Error('Duplicate acceptance created a new conversation instead of reusing existing one!');
    }
    console.log('✅ PASS: Duplicate acceptance safely reused existing conversation.');

    // Test 3: Unauthorized user access (Priya cannot access Alex & AWS conversation)
    console.log('\n--- Test 3: Unauthorized third-party cannot read or send to this conversation ---');
    const unauthGet = await request(`/api/conversations/${conversationId}`, {
      token: priyaToken,
    });
    if (unauthGet.status !== 403) {
      throw new Error(`Expected 403 Forbidden for unauthorized user, got ${unauthGet.status}`);
    }
    const unauthSend = await request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      token: priyaToken,
      body: { messageText: 'Sneaky message' },
    });
    if (unauthSend.status !== 403) {
      throw new Error(`Expected 403 Forbidden for unauthorized user message post, got ${unauthSend.status}`);
    }
    console.log('✅ PASS: Server-side authorization protected conversation from unauthorized users.');

    // Test 4: Creator sends message
    console.log('\n--- Test 4: Creator sends message ---');
    const creatorMsgRes = await request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      token: creatorToken,
      body: { messageText: 'Thanks for reaching out! I would love to walk through the AWS CLI in an interactive deep dive.' },
    });
    if (creatorMsgRes.status !== 201 || !creatorMsgRes.data?.data?.id) {
      throw new Error(`Creator send message failed: ${JSON.stringify(creatorMsgRes.data)}`);
    }
    console.log('✅ PASS: Creator message persisted in PostgreSQL.');

    // Test 5: Brand retrieves conversation and sees Creator message
    console.log('\n--- Test 5: Brand retrieves conversation and sees Creator message ---');
    const brandGet = await request(`/api/conversations/${conversationId}`, {
      token: brandToken,
    });
    if (brandGet.status !== 200 || !brandGet.data?.data?.messages) {
      throw new Error(`Brand get conversation failed: ${JSON.stringify(brandGet.data)}`);
    }
    const messages = brandGet.data.data.messages;
    const hasCreatorMsg = messages.some((m: any) => m.messageText.includes('walk through the AWS CLI'));
    if (!hasCreatorMsg) {
      throw new Error('Creator message was not found in conversation history retrieved by Brand!');
    }
    console.log(`✅ PASS: Brand sees all ${messages.length} messages in conversation.`);

    // Test 6: Brand replies
    console.log('\n--- Test 6: Brand replies to Creator ---');
    const brandMsgRes = await request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      token: brandToken,
      body: { messageText: 'Sounds fantastic Alex! Does a budget of ₹50,000 for the dedicated tutorial work for you?' },
    });
    if (brandMsgRes.status !== 201) {
      throw new Error(`Brand reply failed: ${JSON.stringify(brandMsgRes.data)}`);
    }
    console.log('✅ PASS: Brand reply persisted in PostgreSQL.');

    // Test 7: Creator retrieves updated conversation and sees Brand reply
    console.log('\n--- Test 7: Creator retrieves conversation and sees Brand reply ---');
    const creatorGet = await request(`/api/conversations/${conversationId}`, {
      token: creatorToken,
    });
    const updatedMessages = creatorGet.data.data.messages;
    const hasBrandReply = updatedMessages.some((m: any) => m.messageText.includes('budget of ₹50,000'));
    if (!hasBrandReply) {
      throw new Error('Brand reply was not found in Creator view!');
    }
    console.log(`✅ PASS: Creator successfully received Brand reply (${updatedMessages.length} total messages in thread).`);

    console.log('\n==================================================');
    console.log('SUMMARY: All 7 conversation & messaging tests PASSED!');
    console.log('==================================================\n');
  } finally {
    await stopServer();
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
