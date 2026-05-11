import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { syncPPBCatalog } from '../services/ppbSyncService.js';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

router.get('/search', async (req: AuthRequest, res) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!query || query.length < 2) {
      return successResponse(res, { drugs: [] });
    }

    const drugs = await prisma.drugCatalog.findMany({
      where: {
        OR: [
          { genericName: { contains: query, mode: 'insensitive' } },
          { genericConceptCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { genericName: 'asc' },
    });

    return successResponse(res, { drugs });
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
});

router.get('/:code', async (req: AuthRequest, res) => {
  try {
    const drug = await prisma.drugCatalog.findUnique({
      where: { genericConceptCode: req.params.code },
    });
    if (!drug) {
      return errorResponse(res, 'Drug not found', 404);
    }
    return successResponse(res, drug);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
});

router.post('/sync', requireRole('ADMIN'), async (_req: AuthRequest, res) => {
  try {
    const result = await syncPPBCatalog();
    return successResponse(res, result, 'Drug catalog sync completed');
  } catch (err: any) {
    return errorResponse(res, `Sync failed: ${err.message}`, 500);
  }
});

export default router;
