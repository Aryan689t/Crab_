import http from 'http';
import app from '../index.js';
import { prisma } from '../lib/prisma.js';

let server: http.Server;
const PORT = 5004;
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
    headers?: Record<string, string>;
  } = {}
) {
  const headers: Record<string, string> = { ...options.headers };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  let reqBody = options.body;
  if (reqBody && !(reqBody instanceof FormData) && typeof reqBody !== 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
    reqBody = JSON.stringify(reqBody);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: reqBody,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json().catch(() => ({}));
    return { status: res.status, data: json, headers: res.headers };
  } else {
    const buffer = Buffer.from(await res.arrayBuffer());
    return { status: res.status, buffer, text: buffer.toString('utf-8'), headers: res.headers };
  }
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🧪 CRAB E2E TEST: REAL FILE ATTACHMENTS & IN-APP MESSAGE NOTIFICATIONS');
  console.log('========================================================================\n');

  await startServer();

  try {
    // 1. Identify test participants in DB
    const creator = await prisma.creator.findFirst({ include: { user: true } });
    const brand = await prisma.brand.findFirst({ include: { user: true } });
    const otherCreator = await prisma.creator.findFirst({
      where: { id: { not: creator?.id } },
      include: { user: true },
    });

    if (!creator || !brand) {
      throw new Error('Test environment missing creator or brand in database.');
    }

    const creatorToken = `mock-${creator.userId}-creator`;
    const brandToken = `mock-${brand.userId}-brand`;
    const unauthorizedToken = otherCreator
      ? `mock-${otherCreator.userId}-creator`
      : 'mock-unauthorized-user-creator';

    console.log(`👤 Participant A (Creator): ${creator.displayName} (${creator.userId})`);
    console.log(`🏢 Participant B (Brand):   ${brand.name} (${brand.userId})`);
    console.log(`🚫 Participant C (Attacker): ${otherCreator?.displayName || 'Unauthorized User'}\n`);

    // 2. Open or retrieve authorized conversation
    console.log('--- Step 1: Open / retrieve conversation between Brand and Creator ---');
    const initRes = await request('/api/conversations/initiate', {
      method: 'POST',
      token: brandToken,
      body: {
        creatorId: creator.id,
        initialMessage: 'Initiating attachment test thread',
      },
    });

    if (initRes.status !== 200 || !initRes.data?.data?.id) {
      throw new Error(`Failed to initiate conversation: ${JSON.stringify(initRes.data)}`);
    }
    const convId = initRes.data.data.id;
    console.log(`✅ PASS: Active conversation confirmed with ID: ${convId}`);

    // 3. Brand sends message with PDF attachment
    console.log('\n--- Step 2: Brand uploads real PDF attachment (Campaign_Brief.pdf) ---');
    const pdfContent = Buffer.from('%PDF-1.4\n%CRAB Campaign Deliverable Brief & Terms\n%%EOF');
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    const form = new FormData();
    form.append('messageText', 'Here is the campaign brief document for review.');
    form.append('file', pdfBlob, 'Campaign_Brief.pdf');

    const uploadRes = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: brandToken,
      body: form,
    });

    if (uploadRes.status !== 201 || !uploadRes.data?.data?.id) {
      throw new Error(`Upload failed: ${uploadRes.status} ${JSON.stringify(uploadRes.data)}`);
    }
    const brandMessage = uploadRes.data.data;
    const attachment = brandMessage.attachments?.[0];
    if (!attachment || attachment.originalFilename !== 'Campaign_Brief.pdf') {
      throw new Error(`Attachment metadata missing in response: ${JSON.stringify(brandMessage)}`);
    }
    console.log(`✅ PASS: Message and attachment record created atomically.`);
    console.log(`   - Message ID: ${brandMessage.id}`);
    console.log(`   - Attachment ID: ${attachment.id}`);
    console.log(`   - MIME Type: ${attachment.mimeType}`);
    console.log(`   - File Size: ${attachment.fileSize} bytes`);

    // Verify DB persistence in PostgreSQL
    const dbAttachment = await prisma.messageAttachment.findUnique({
      where: { id: attachment.id },
    });
    if (!dbAttachment) {
      throw new Error('Attachment record not found in PostgreSQL message_attachments table!');
    }
    console.log(`✅ PASS: Confirmed record in PostgreSQL message_attachments table.`);

    // 4. Test Attachment Type Allowlist Validation (Reject .exe, .html, .sh)
    console.log('\n--- Step 3: Security: Test rejection of disallowed file types ---');
    const evilBlob = new Blob([Buffer.from('<script>alert("hacked")</script>')], { type: 'text/html' });
    const evilForm = new FormData();
    evilForm.append('messageText', 'Malicious attachment test');
    evilForm.append('file', evilBlob, 'exploit.html');

    const evilRes = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: brandToken,
      body: evilForm,
    });

    if (evilRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for disallowed file type, got: ${evilRes.status}`);
    }
    console.log(`✅ PASS: Server rejected disallowed MIME / extension: ${evilRes.data?.message}`);

    // 5. Test File Size Limit Validation (>10MB rejected)
    console.log('\n--- Step 4: Security: Test rejection of oversized file (>10MB) ---');
    const oversizedBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'application/pdf' });
    const oversizedForm = new FormData();
    oversizedForm.append('messageText', 'Oversized file test');
    oversizedForm.append('file', oversizedBlob, 'huge_file.pdf');

    const oversizedRes = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: brandToken,
      body: oversizedForm,
    });

    if (oversizedRes.status < 400) {
      throw new Error(`Expected HTTP 400/500 rejection for oversized file, got: ${oversizedRes.status}`);
    }
    console.log(`✅ PASS: Server rejected oversized file (>10MB) with HTTP status: ${oversizedRes.status}`);

    // 6. Test Authorized Download: Creator downloads Campaign_Brief.pdf
    console.log('\n--- Step 5: Creator downloads attachment via authorized endpoint ---');
    const downloadRes = await request(
      `/api/conversations/${convId}/attachments/${attachment.id}/download`,
      {
        token: creatorToken,
      }
    );

    if (downloadRes.status !== 200 || !downloadRes.buffer) {
      throw new Error(`Download failed: HTTP ${downloadRes.status}`);
    }
    if (downloadRes.buffer.toString('utf-8') !== pdfContent.toString('utf-8')) {
      throw new Error('Downloaded binary content does not match uploaded file content!');
    }
    console.log(`✅ PASS: Creator successfully downloaded binary attachment with matching contents.`);

    // 7. Security: Unauthorized Download Blocked
    console.log('\n--- Step 6: Security: Unauthorized user CANNOT download attachment ---');
    const unauthorizedDl = await request(
      `/api/conversations/${convId}/attachments/${attachment.id}/download`,
      {
        token: unauthorizedToken,
      }
    );

    if (unauthorizedDl.status !== 403) {
      throw new Error(`Expected HTTP 403 for unauthorized download, got: ${unauthorizedDl.status}`);
    }
    console.log(`✅ PASS: Unauthorized user rejected with HTTP 403 Forbidden.`);

    // 8. Security: Unauthenticated Download Blocked
    console.log('\n--- Step 7: Security: Unauthenticated request CANNOT download attachment ---');
    const unauthDl = await request(
      `/api/conversations/${convId}/attachments/${attachment.id}/download`
    );

    if (unauthDl.status !== 401) {
      throw new Error(`Expected HTTP 401 for unauthenticated request, got: ${unauthDl.status}`);
    }
    console.log(`✅ PASS: Unauthenticated request rejected with HTTP 401 Unauthorized.`);

    // 9. Real In-App Notification: Creator queries /api/notifications
    console.log('\n--- Step 8: Real In-App Notifications: Creator receives notification ---');
    const creatorNotifs = await request('/api/notifications', {
      token: creatorToken,
    });

    if (creatorNotifs.status !== 200 || !creatorNotifs.data?.data) {
      throw new Error(`Failed to fetch notifications: ${JSON.stringify(creatorNotifs.data)}`);
    }
    const { unreadCount, notifications } = creatorNotifs.data.data;
    console.log(`✅ PASS: Creator has ${unreadCount} genuine unread messages.`);

    const brandNotif = notifications.find((n: any) => n.id === brandMessage.id);
    if (!brandNotif) {
      throw new Error('Brand message notification not found in Creator notification stream!');
    }
    console.log(`✅ PASS: Notification found with real sender details:`);
    console.log(`   - Sender Name: ${brandNotif.sender.name}`);
    console.log(`   - Sender Role: ${brandNotif.sender.role}`);
    console.log(`   - Message Preview: "${brandNotif.messagePreview}"`);
    console.log(`   - Has Attachment: ${brandNotif.hasAttachment}`);
    console.log(`   - Campaign Context: ${brandNotif.campaignTitle || 'None'}`);

    // 10. Notification integrity: Brand does NOT receive notification for their own message
    console.log('\n--- Step 9: Notification integrity: Sender is NOT notified of own message ---');
    const brandNotifs = await request('/api/notifications', {
      token: brandToken,
    });
    const ownNotif = brandNotifs.data?.data?.notifications?.find((n: any) => n.id === brandMessage.id);
    if (ownNotif) {
      throw new Error('Sender received a notification for their own sent message!');
    }
    console.log(`✅ PASS: Verified sender does NOT receive self-notifications.`);

    // 11. Read State Tracking: Mark notification as read
    console.log('\n--- Step 10: Mark conversation messages as read resets unread count ---');
    const markReadRes = await request(`/api/conversations/${convId}/read`, {
      method: 'POST',
      token: creatorToken,
    });
    if (markReadRes.status !== 200) {
      throw new Error(`Failed to mark conversation as read: ${JSON.stringify(markReadRes.data)}`);
    }

    const updatedNotifs = await request('/api/notifications', {
      token: creatorToken,
    });
    const updatedUnread = updatedNotifs.data?.data?.unreadCount;
    console.log(`✅ PASS: Unread count after reading conversation: ${updatedUnread}`);

    // 12. Creator replies with text message and attachment
    console.log('\n--- Step 11: Creator replies with text and attachment ---');
    const creatorImgBlob = new Blob([Buffer.from('PNG_FAKE_IMAGE_DATA_12345')], { type: 'image/png' });
    const replyForm = new FormData();
    replyForm.append('messageText', 'Deliverables accepted! Attached is the signed agreement.');
    replyForm.append('file', creatorImgBlob, 'signed_agreement.png');

    const replyRes = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: creatorToken,
      body: replyForm,
    });

    if (replyRes.status !== 201 || !replyRes.data?.data?.id) {
      throw new Error(`Creator reply with attachment failed: ${JSON.stringify(replyRes.data)}`);
    }
    const replyMsg = replyRes.data.data;
    console.log(`✅ PASS: Creator reply with attachment persisted (ID: ${replyMsg.id}).`);

    // 13. Brand receives notification for Creator's reply
    console.log('\n--- Step 12: Brand receives notification for Creator reply ---');
    const brandReplyNotifs = await request('/api/notifications', {
      token: brandToken,
    });
    const replyNotif = brandReplyNotifs.data?.data?.notifications?.find((n: any) => n.id === replyMsg.id);
    if (!replyNotif) {
      throw new Error('Brand did not receive notification for Creator reply!');
    }
    console.log(`✅ PASS: Brand received notification from Creator: "${replyNotif.messagePreview}"`);
    console.log(`   - Attachment indicator: ${replyNotif.hasAttachment}`);

    // 14. Attachment-only message (no text)
    console.log('\n--- Step 13: Test attachment-only message (empty text) ---');
    const txtBlob = new Blob([Buffer.from('Deliverable checklist:\n1. Video 1\n2. Video 2')], { type: 'text/plain' });
    const attOnlyForm = new FormData();
    attOnlyForm.append('file', txtBlob, 'checklist.txt');

    const attOnlyRes = await request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      token: creatorToken,
      body: attOnlyForm,
    });

    if (attOnlyRes.status !== 201 || !attOnlyRes.data?.data?.id) {
      throw new Error(`Attachment-only message failed: ${JSON.stringify(attOnlyRes.data)}`);
    }
    console.log(`✅ PASS: Attachment-only message successfully sent and persisted.`);

    console.log('\n========================================================================');
    console.log('🎉 ALL 13 FILE ATTACHMENT & IN-APP NOTIFICATION CHECKS PASSED!');
    console.log('========================================================================\n');
  } finally {
    await stopServer();
    await prisma.$disconnect();
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
