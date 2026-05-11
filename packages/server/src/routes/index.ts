import { Router } from 'express';
import authRoutes from './auth.js';
import templateRoutes from './templates.js';
import drugRoutes from './drugs.js';
import icdRoutes from './icd.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/templates', templateRoutes);
router.use('/drugs', drugRoutes);
router.use('/icd', icdRoutes);

export default router;
