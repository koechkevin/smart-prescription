import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createTemplateSchema, updateTemplateSchema, listTemplatesSchema } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = createTemplateSchema.parse(req.body);
    const template = await prisma.prescriptionTemplate.create({
      data: {
        templateName: data.templateName,
        description: data.description,
        icd11Code: data.icd11Code,
        icd11Description: data.icd11Description,
        visibility: data.visibility as any,
        instructions: data.instructions,
        createdById: req.user!.id,
        findings: {
          create: (data.findings || []).map((f, i) => ({
            finding: f.finding,
            findingType: f.findingType as any,
            isRequired: f.isRequired ?? false,
            sortOrder: f.sortOrder ?? i,
          })),
        },
        drugItems: {
          create: data.drugItems.map((d, i) => ({
            drugCode: d.drugCode,
            drugName: d.drugName,
            dosage: d.dosage,
            frequency: d.frequency,
            duration: d.duration,
            durationUnit: d.durationUnit as any,
            routeOfAdministration: d.routeOfAdministration,
            instructions: d.instructions,
            sortOrder: d.sortOrder ?? i,
          })),
        },
      },
      include: { findings: true, drugItems: true, createdBy: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, template, 'Template created');
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return errorResponse(res, 'Validation error', 400, err.errors);
    }
    return errorResponse(res, err.message, 500);
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const params = listTemplatesSchema.parse(req.query);
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionTemplateWhereInput = {
      OR: [
        { visibility: 'PUBLIC' },
        { createdById: req.user!.id },
      ],
    };

    if (params.icd_code) {
      where.icd11Code = { contains: params.icd_code, mode: 'insensitive' };
    }
    if (params.visibility) {
      where.visibility = params.visibility as any;
      if (params.visibility === 'PRIVATE') {
        where.createdById = req.user!.id;
      }
    }
    if (params.search) {
      where.AND = [
        where.AND as any || {},
        {
          OR: [
            { templateName: { contains: params.search, mode: 'insensitive' } },
            { icd11Code: { contains: params.search, mode: 'insensitive' } },
            { icd11Description: { contains: params.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.prescriptionTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          findings: { orderBy: { sortOrder: 'asc' } },
          drugItems: { orderBy: { sortOrder: 'asc' } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.prescriptionTemplate.count({ where }),
    ]);

    return successResponse(res, templates, undefined, { total, page, limit });
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const template = await prisma.prescriptionTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        findings: { orderBy: { sortOrder: 'asc' } },
        drugItems: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    if (template.visibility === 'PRIVATE' && template.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
      return errorResponse(res, 'Template not found', 404);
    }

    return successResponse(res, template);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
});

router.get('/:id/use', async (req: AuthRequest, res) => {
  try {
    const template = await prisma.prescriptionTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        findings: { orderBy: { sortOrder: 'asc' } },
        drugItems: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    if (template.visibility === 'PRIVATE' && template.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
      return errorResponse(res, 'Template not found', 404);
    }

    const prescriptionData = {
      templateId: template.id,
      templateName: template.templateName,
      icd11Code: template.icd11Code,
      icd11Description: template.icd11Description,
      findings: template.findings.map(f => ({
        finding: f.finding,
        findingType: f.findingType,
        isRequired: f.isRequired,
      })),
      instructions: template.instructions,
      items: template.drugItems.map(d => ({
        drugCode: d.drugCode,
        drugName: d.drugName,
        dosage: d.dosage,
        frequency: d.frequency,
        duration: d.duration,
        durationUnit: d.durationUnit,
        routeOfAdministration: d.routeOfAdministration,
        instructions: d.instructions,
      })),
    };

    return successResponse(res, prescriptionData);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.prescriptionTemplate.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return errorResponse(res, 'Template not found', 404);
    }
    if (existing.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
      return errorResponse(res, 'Not authorized to update this template', 403);
    }

    const data = updateTemplateSchema.parse(req.body);

    const template = await prisma.$transaction(async (tx) => {
      if (data.findings) {
        await tx.templateFinding.deleteMany({ where: { templateId: req.params.id } });
      }
      if (data.drugItems) {
        await tx.templateDrugItem.deleteMany({ where: { templateId: req.params.id } });
      }

      return tx.prescriptionTemplate.update({
        where: { id: req.params.id },
        data: {
          ...(data.templateName && { templateName: data.templateName }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.icd11Code && { icd11Code: data.icd11Code }),
          ...(data.icd11Description !== undefined && { icd11Description: data.icd11Description }),
          ...(data.visibility && { visibility: data.visibility as any }),
          ...(data.instructions !== undefined && { instructions: data.instructions }),
          ...(data.findings && {
            findings: {
              create: data.findings.map((f, i) => ({
                finding: f.finding,
                findingType: f.findingType as any,
                isRequired: f.isRequired ?? false,
                sortOrder: f.sortOrder ?? i,
              })),
            },
          }),
          ...(data.drugItems && {
            drugItems: {
              create: data.drugItems.map((d, i) => ({
                drugCode: d.drugCode,
                drugName: d.drugName,
                dosage: d.dosage,
                frequency: d.frequency,
                duration: d.duration,
                durationUnit: d.durationUnit as any,
                routeOfAdministration: d.routeOfAdministration,
                instructions: d.instructions,
                sortOrder: d.sortOrder ?? i,
              })),
            },
          }),
        },
        include: { findings: true, drugItems: true, createdBy: { select: { id: true, name: true } } },
      });
    });

    return successResponse(res, template, 'Template updated');
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return errorResponse(res, 'Validation error', 400, err.errors);
    }
    return errorResponse(res, err.message, 500);
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.prescriptionTemplate.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return errorResponse(res, 'Template not found', 404);
    }
    if (existing.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
      return errorResponse(res, 'Not authorized to delete this template', 403);
    }

    await prisma.prescriptionTemplate.delete({ where: { id: req.params.id } });
    return successResponse(res, null, 'Template deleted');
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
});

export default router;
