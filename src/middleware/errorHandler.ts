import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err); // Replace with a logger in prod


  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

    res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
  return;
}