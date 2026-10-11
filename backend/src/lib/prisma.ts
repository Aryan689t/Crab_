import { PrismaClient } from '@prisma/client';
import { config } from '../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaClientInstance: PrismaClient | undefined;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (!config.databaseUrl) {
      throw new Error('DATABASE_UNCONFIGURED');
    }
    
    if (!globalThis.prismaClientInstance) {
      globalThis.prismaClientInstance = new PrismaClient({
        log: config.isDevelopment ? ['error', 'warn'] : ['error'],
      });
    }
    
    return Reflect.get(globalThis.prismaClientInstance, prop, receiver);
  }
});
