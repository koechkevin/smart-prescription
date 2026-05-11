import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return errorResponse(res, 'Email already registered', 409);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, password: hashed, role: data.role as any },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as string | number,
    } as jwt.SignOptions);

    return successResponse(res, { user, token }, 'Registration successful');
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return errorResponse(res, 'Validation error', 400, err.errors);
    }
    return errorResponse(res, err.message, 500);
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as string | number,
    } as jwt.SignOptions);

    return successResponse(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    }, 'Login successful');
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return errorResponse(res, 'Validation error', 400, err.errors);
    }
    return errorResponse(res, err.message, 500);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
});

export default router;
