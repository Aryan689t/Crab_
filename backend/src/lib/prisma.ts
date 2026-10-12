import { PrismaClient } from '@prisma/client';
import { config } from '../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaClientInstance: PrismaClient | undefined;
}

export const prisma = new Proxy({} as PrismaClient & { application: any; applications: any }, {
  get(target, prop, receiver) {
    if (!config.databaseUrl) {
      throw new Error('DATABASE_UNCONFIGURED');
    }
    
    if (!globalThis.prismaClientInstance) {
      globalThis.prismaClientInstance = new PrismaClient({
        datasources: {
          db: {
            url: config.databaseUrl || config.directUrl,
          },
        },
        log: config.isDevelopment ? ['error', 'warn'] : ['error'],
      });
    }
    
    const instance = globalThis.prismaClientInstance as any;
    if (prop === 'applications') {
      return instance.application || instance.applications;
    }
    if (prop === 'application') {
      return instance.application || instance.applications;
    }
    
    return Reflect.get(instance, prop, receiver);
  }
});
