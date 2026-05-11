export interface PrescriptionTemplate {
  id: string;
  templateName: string;
  description?: string;
  icd11Code: string;
  icd11Description?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  instructions?: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  findings: TemplateFinding[];
  drugItems: TemplateDrugItem[];
}

export interface TemplateFinding {
  id?: string;
  finding: string;
  findingType: FindingType;
  isRequired: boolean;
  sortOrder?: number;
}

export interface TemplateDrugItem {
  id?: string;
  drugCode: string;
  drugName: string;
  dosage?: string;
  frequency?: string;
  duration?: number;
  durationUnit: DurationUnit;
  routeOfAdministration?: string;
  instructions?: string;
  sortOrder?: number;
}

export interface DrugCatalogItem {
  id: string;
  genericConceptCode: string;
  genericName: string;
  strength?: string;
  route?: string;
  dosageForm?: string;
}

export interface ICD11Result {
  code: string;
  title: string;
  chapter: string;
  score: number;
}

export interface PrescriptionData {
  templateId: string;
  templateName: string;
  icd11Code: string;
  icd11Description?: string;
  findings: Array<{ finding: string; findingType: string; isRequired: boolean }>;
  instructions?: string;
  items: Array<{
    drugCode: string;
    drugName: string;
    dosage?: string;
    frequency?: string;
    duration?: number;
    durationUnit: string;
    routeOfAdministration?: string;
    instructions?: string;
  }>;
}

export interface TemplateManagerProps {
  apiBaseUrl: string;
  authToken: string;
  onUseTemplate?: (data: PrescriptionData) => void;
  mode?: 'standalone' | 'embedded';
  initialIcdCode?: string;
  userId?: string;
}

export type FindingType = 'OBSERVATION' | 'SYMPTOM' | 'SIGN' | 'VITAL' | 'LAB_RESULT';
export type DurationUnit = 'DAYS' | 'WEEKS' | 'MONTHS';
export type Visibility = 'PRIVATE' | 'PUBLIC';
