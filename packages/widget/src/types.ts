export interface WidgetOptions {
  container: HTMLElement | string;
  apiBaseUrl: string;
  authToken: string;
  mode?: 'list' | 'form' | 'full';
  initialFilters?: { icd_code?: string };
}

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
  findings: TemplateFinding[];
  drugItems: TemplateDrugItem[];
}

export interface TemplateFinding {
  finding: string;
  findingType: string;
  isRequired: boolean;
}

export interface TemplateDrugItem {
  drugCode: string;
  drugName: string;
  dosage?: string;
  frequency?: string;
  duration?: number;
  durationUnit?: string;
  routeOfAdministration?: string;
  instructions?: string;
}

export interface PrescriptionData {
  templateId: string;
  templateName: string;
  icd11Code: string;
  icd11Description?: string;
  findings: TemplateFinding[];
  instructions?: string;
  items: TemplateDrugItem[];
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
}
