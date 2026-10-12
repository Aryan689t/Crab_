import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.creator.count();
    console.log('Creator records:', count);
}

main()
    .catch((error: unknown) => {
        console.error(
            'Database query failed:',
            error instanceof Error ? error.message : 'Unknown error',
        );
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
