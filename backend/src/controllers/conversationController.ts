import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * GET /api/conversations
 * Lists all conversations for the authenticated user (Creator or Brand).
 */
export async function listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    let conversations: any[] = [];

    if (req.user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (!creator) {
        res.status(404).json({ error: 'NotFound', message: 'Creator profile not found.' });
        return;
      }

      conversations = await prisma.conversation.findMany({
        where: { creatorId: creator.id },
        include: {
          brand: {
            select: { id: true, name: true, category: true, userId: true },
          },
          creator: {
            select: { id: true, displayName: true, profileImageUrl: true, userId: true },
          },
          campaign: {
            select: { id: true, title: true, budgetMin: true, budgetMax: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else if (req.user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (!brand) {
        res.status(404).json({ error: 'NotFound', message: 'Brand profile not found.' });
        return;
      }

      conversations = await prisma.conversation.findMany({
        where: { brandId: brand.id },
        include: {
          brand: {
            select: { id: true, name: true, category: true, userId: true },
          },
          creator: {
            select: { id: true, displayName: true, profileImageUrl: true, userId: true },
          },
          campaign: {
            select: { id: true, title: true, budgetMin: true, budgetMax: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    res.status(200).json({
      data: conversations,
      meta: { total: conversations.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/conversations/:id
 * Retrieves details and full message history of a specific conversation.
 * Requires participation in the conversation.
 */
export async function getConversationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const id = String(req.params.id);
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        brand: {
          select: { id: true, name: true, category: true, userId: true },
        },
        creator: {
          select: { id: true, displayName: true, profileImageUrl: true, userId: true },
        },
        campaign: {
          select: { id: true, title: true, budgetMin: true, budgetMax: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'NotFound', message: 'Conversation not found.' });
      return;
    }

    // Server-side authorization check
    const isParticipant =
      conversation.creator?.userId === req.user.id || conversation.brand?.userId === req.user.id;
    if (!isParticipant) {
      res.status(403).json({ error: 'Forbidden', message: 'You are not a participant in this conversation.' });
      return;
    }

    res.status(200).json({ data: conversation });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/conversations/:id/messages
 * Appends a new message to the conversation.
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const id = String(req.params.id);
    const { messageText, text } = req.body;
    const content = String(messageText || text || '').trim();

    if (!content) {
      res.status(400).json({ error: 'BadRequest', message: 'Message text cannot be empty.' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        brand: { select: { userId: true } },
        creator: { select: { userId: true } },
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'NotFound', message: 'Conversation not found.' });
      return;
    }

    // Verify sender is participant
    const isParticipant =
      conversation.creator?.userId === req.user.id || conversation.brand?.userId === req.user.id;
    if (!isParticipant) {
      res.status(403).json({ error: 'Forbidden', message: 'You cannot send messages to this conversation.' });
      return;
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderUserId: req.user.id,
          messageText: content,
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      }),
    ]);

    res.status(201).json({
      message: 'Message sent successfully.',
      data: message,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/requests/:id/accept
 * POST /api/creators/me/requests/:id/accept
 * Accepts a brand invitation, creates/retrieves conversation in PostgreSQL, and seeds initial context if needed.
 */
export async function acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Only creator accounts can accept collaboration invitations.',
      });
      return;
    }

    const id = String(req.params.id || '');
    const { brandId, campaignId, snippet } = req.body;

    const creator = await prisma.creator.findUnique({
      where: { userId: req.user.id },
      select: { id: true, displayName: true },
    });

    if (!creator) {
      res.status(404).json({ error: 'NotFound', message: 'Creator profile not found.' });
      return;
    }

    // Determine target brand and campaign
    let targetBrandId: string = brandId;
    let targetCampaignId: string | undefined = campaignId;

    if (!targetBrandId) {
      const idLower = id.toLowerCase();
      if (id === 'req_1' || idLower.includes('aws')) {
        targetBrandId = 'demo_brand_01';
        targetCampaignId = targetCampaignId || 'demo_cmp_aws_01';
      } else if (id === 'req_2' || idLower.includes('veloce') || idLower.includes('cursor')) {
        targetBrandId = 'demo_brand_02';
        targetCampaignId = targetCampaignId || 'demo_cmp_veloce_02';
      } else {
        // Default to demo_brand_01 (AWS)
        targetBrandId = 'demo_brand_01';
        targetCampaignId = targetCampaignId || 'demo_cmp_aws_01';
      }
    }

    // Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: targetBrandId },
      select: { id: true, name: true, userId: true },
    });

    if (!brand) {
      res.status(404).json({ error: 'NotFound', message: 'Inviting brand not found.' });
      return;
    }

    // Look for existing conversation to prevent duplicates
    let conversation = await prisma.conversation.findFirst({
      where: {
        creatorId: creator.id,
        brandId: brand.id,
        ...(targetCampaignId ? { campaignId: targetCampaignId } : {}),
      },
      include: {
        brand: { select: { id: true, name: true, category: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImageUrl: true, userId: true } },
        campaign: { select: { id: true, title: true, budgetMin: true, budgetMax: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      // Idempotently create conversation and seed brand initial invitation note in PostgreSQL
      const brandUserId = brand.userId || 'demo_user_brand_01';
      conversation = await prisma.$transaction(async (tx) => {
        const newConv = await tx.conversation.create({
          data: {
            creatorId: creator.id,
            brandId: brand.id,
            campaignId: targetCampaignId || undefined,
          },
          include: {
            brand: { select: { id: true, name: true, category: true, userId: true } },
            creator: { select: { id: true, displayName: true, profileImageUrl: true, userId: true } },
            campaign: { select: { id: true, title: true, budgetMin: true, budgetMax: true } },
            messages: true,
          },
        });

        const initialNote =
          snippet ||
          `Hi ${creator.displayName}, we reviewed your recent developer content and would love to partner with you for our campaign! Let's align on deliverables and schedule here.`;

        const initialMsg = await tx.message.create({
          data: {
            conversationId: newConv.id,
            senderUserId: brandUserId,
            messageText: initialNote,
          },
        });

        return {
          ...newConv,
          messages: [initialMsg],
        };
      });
    }

    // 4. Create or reuse collaboration record idempotently
    let collaboration = await prisma.collaboration.findFirst({
      where: {
        creatorId: creator.id,
        brandId: brand.id,
        ...(targetCampaignId ? { campaignId: targetCampaignId } : {}),
      },
    });

    if (!collaboration) {
      collaboration = await prisma.collaboration.create({
        data: {
          creatorId: creator.id,
          brandId: brand.id,
          campaignId: targetCampaignId || undefined,
          conversationId: conversation.id,
          status: 'AGREED',
        },
      });
    } else if (collaboration.status === 'PROPOSED') {
      collaboration = await prisma.collaboration.update({
        where: { id: collaboration.id },
        data: {
          status: 'AGREED',
          conversationId: conversation.id,
        },
      });
    }

    if (!conversation.collaborationId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { collaborationId: collaboration.id },
      }).catch(() => null);
    }

    res.status(200).json({
      message: 'Invitation accepted successfully.',
      data: {
        requestId: id,
        status: 'ACCEPTED',
        conversationId: conversation.id,
        collaborationId: collaboration.id,
        conversation,
        collaboration,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/conversations/initiate
 * (and POST /api/conversations)
 * Brand initiates a conversation / collaboration proposal with a creator.
 * Role required: BRAND.
 */
export async function initiateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const { creatorId, campaignId, initialMessage, message, proposedAmount, budget } = req.body || {};
    if (!creatorId) {
      res.status(400).json({ error: 'BadRequest', message: 'Creator ID is required to initiate a conversation.' });
      return;
    }

    // Identify brand profile
    const brand = await prisma.brand.findUnique({
      where: { userId: req.user.id },
      select: { id: true, name: true, userId: true },
    });

    if (!brand) {
      res.status(404).json({ error: 'BrandNotFound', message: 'No brand profile found for current user.' });
      return;
    }

    // Identify target creator profile
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    if (!creator) {
      res.status(404).json({ error: 'CreatorNotFound', message: 'Target creator profile not found.' });
      return;
    }

    const msgContent = String(initialMessage || message || `Hi ${creator.displayName}, we reviewed your profile and would love to collaborate on our campaign! Let's align on details here.`).trim();
    const parsedAmount = proposedAmount ? Number(proposedAmount) : budget ? Number(String(budget).replace(/[^0-9.]/g, '')) : undefined;

    // Check for existing conversation between this brand and creator
    let conversation = await prisma.conversation.findFirst({
      where: {
        creatorId: creator.id,
        brandId: brand.id,
        ...(campaignId ? { campaignId } : {}),
      },
      include: {
        brand: { select: { id: true, name: true, category: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImageUrl: true, userId: true } },
        campaign: { select: { id: true, title: true, budgetMin: true, budgetMax: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      conversation = await prisma.$transaction(async (tx) => {
        const newConv = await tx.conversation.create({
          data: {
            creatorId: creator.id,
            brandId: brand.id,
            campaignId: campaignId || undefined,
          },
          include: {
            brand: { select: { id: true, name: true, category: true, userId: true } },
            creator: { select: { id: true, displayName: true, profileImageUrl: true, userId: true } },
            campaign: { select: { id: true, title: true, budgetMin: true, budgetMax: true } },
            messages: true,
          },
        });

        // Create collaboration proposal in PostgreSQL
        const collab = await tx.collaboration.create({
          data: {
            creatorId: creator.id,
            brandId: brand.id,
            campaignId: campaignId || undefined,
            conversationId: newConv.id,
            agreedAmount: parsedAmount ? parsedAmount : undefined,
            status: 'PROPOSED',
          },
        });

        await tx.conversation.update({
          where: { id: newConv.id },
          data: { collaborationId: collab.id },
        });

        const firstMsg = await tx.message.create({
          data: {
            conversationId: newConv.id,
            senderUserId: req.user!.id,
            messageText: msgContent,
          },
        });

        return {
          ...newConv,
          collaborationId: collab.id,
          messages: [firstMsg],
        };
      });
    } else {
      // Append new message if provided
      if (msgContent) {
        const appended = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderUserId: req.user.id,
            messageText: msgContent,
          },
        });
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });
        conversation.messages.push(appended as any);
      }
    }

    res.status(200).json({
      message: 'Conversation and collaboration proposal initiated successfully.',
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
}
