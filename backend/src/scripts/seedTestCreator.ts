import { prisma } from '../lib/prisma.js';

async function seed() {
  const email = 'new.creator.test@crab.demo';
  const userId = 'user_new_creator_test';

  await prisma.socialAccount.deleteMany({
    where: { creator: { user: { email } } },
  });
  await prisma.creator.deleteMany({
    where: { user: { email } },
  });
  await prisma.user.deleteMany({
    where: { email },
  });

  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      role: 'CREATOR',
    },
  });

  const creator = await prisma.creator.create({
    data: {
      userId: user.id,
      displayName: 'New Unboarded Creator',
      contactInformation: { email },
      preferences: {}, // No onboardingCompleted flag, no social accounts
    },
  });

  console.log('Seeded unboarded creator:', { userId: user.id, email: user.email, creatorId: creator.id });
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
