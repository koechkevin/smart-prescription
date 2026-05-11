import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['PHYSICIAN', 'PHARMACIST', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createTemplateSchema = z.object({
  templateName: z.string().min(1),
  description: z.string().optional(),
  icd11Code: z.string().min(1),
  icd11Description: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  instructions: z.string().optional(),
  findings: z.array(z.object({
    finding: z.string().min(1),
    findingType: z.enum(['OBSERVATION', 'SYMPTOM', 'SIGN', 'VITAL', 'LAB_RESULT']).optional(),
    isRequired: z.boolean().optional(),
    sortOrder: z.number().optional(),
  })).optional(),
  drugItems: z.array(z.object({
    drugCode: z.string().min(1),
    drugName: z.string().min(1),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    duration: z.number().optional(),
    durationUnit: z.enum(['DAYS', 'WEEKS', 'MONTHS']).optional(),
    routeOfAdministration: z.string().optional(),
    instructions: z.string().optional(),
    sortOrder: z.number().optional(),
  })).min(1, 'At least one drug item is required'),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const listTemplatesSchema = z.object({
  icd_code: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});
