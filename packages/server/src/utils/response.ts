import { Response } from 'express';

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

export function successResponse(res: Response, data: unknown, message?: string, pagination?: Pagination) {
  const body: Record<string, unknown> = { success: true, data };
  if (message) body.message = message;
  if (pagination) body.pagination = pagination;
  return res.json(body);
}

export function errorResponse(res: Response, message: string, statusCode = 400, errors?: unknown) {
  const body: Record<string, unknown> = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}
