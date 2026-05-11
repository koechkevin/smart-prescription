import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { searchICD11 } from '../services/icdService.js';

const router = Router();

router.use(authenticate);

router.get('/search', async (req: AuthRequest, res) => {
  try {
    const query = (req.query.q as string) || '';
    if (!query || query.length < 2) {
      return successResponse(res, { results: [] });
    }

    const results = await searchICD11(query);
    return successResponse(res, { results });
  } catch (err: any) {
    return errorResponse(res, `ICD-11 search failed: ${err.message}`, 502);
  }
});

export default router;
