import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Request payload validation failed.',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle generic / unexpected server errors
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  const status = 'status' in err && typeof (err as any).status === 'number' ? (err as any).status : 500;
  const message = config.isDevelopment ? err.message : 'Internal server error occurred.';

  res.status(status).json({
    error: err.name || 'InternalServerError',
    message,
    ...(config.isDevelopment && { stack: err.stack }),
  });
}
