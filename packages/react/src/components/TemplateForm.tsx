import React, { useState } from 'react';
import { Form, Input, Button, Divider, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { templateApi } from '../services/api';
import { ICD11Selector } from './ICD11Selector';
import { DrugSearch } from './DrugSearch';
import { DrugEntryForm } from './DrugEntryForm';
import { FindingsEditor } from './FindingsEditor';
import { VisibilityToggle } from './VisibilityToggle';
import type { PrescriptionTemplate, TemplateDrugItem, TemplateFinding, DrugCatalogItem, Visibility } from '../types';

interface TemplateFormProps {
  template?: PrescriptionTemplate;
  onSaved?: (template: PrescriptionTemplate) => void;
  onCancel?: () => void;
}

export function TemplateForm({ template, onSaved, onCancel }: TemplateFormProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [drugItems, setDrugItems] = useState<TemplateDrugItem[]>(template?.drugItems || []);
  const [findings, setFindings] = useState<TemplateFinding[]>(template?.findings || []);
  const [visibility, setVisibility] = useState<Visibility>(template?.visibility || 'PRIVATE');
  const [icd, setIcd] = useState<{ code: string; description: string } | undefined>(
    template ? { code: template.icd11Code, description: template.icd11Description || '' } : undefined
  );

  const handleDrugSelect = (drug: DrugCatalogItem) => {
    const exists = drugItems.some((d) => d.drugCode === drug.genericConceptCode);
    if (exists) {
      message.warning('Drug already added');
      return;
    }
    setDrugItems([
      ...drugItems,
      {
        drugCode: drug.genericConceptCode,
        drugName: drug.genericName,
        dosage: '',
        frequency: '',
        duration: undefined,
        durationUnit: 'DAYS',
        routeOfAdministration: drug.route || '',
        instructions: '',
      },
    ]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!icd) {
        message.error('Please select an ICD-11 diagnosis');
        return;
      }
      if (drugItems.length === 0) {
        message.error('Please add at least one medication');
        return;
      }

      setSaving(true);
      const payload = {
        templateName: values.templateName,
        description: values.description,
        icd11Code: icd.code,
        icd11Description: icd.description,
        visibility,
        instructions: values.instructions,
        findings: findings.filter((f) => f.finding.trim()),
        drugItems: drugItems.map((d, i) => ({ ...d, sortOrder: i })),
      };

      let result;
      if (template) {
        result = await templateApi.update(template.id, payload);
      } else {
        result = await templateApi.create(payload);
      }

      message.success(template ? 'Template updated' : 'Template created');
      onSaved?.(result.data);
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={saving}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            templateName: template?.templateName || '',
            description: template?.description || '',
            instructions: template?.instructions || '',
          }}
        >
          <Divider orientation="left">Basic Information</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="templateName" label="Template Name" rules={[{ required: true, message: 'Required' }]}>
              <Input placeholder="e.g., Malaria Treatment Protocol" />
            </Form.Item>
            <Form.Item label="ICD-11 Diagnosis" required>
              <ICD11Selector value={icd} onChange={setIcd} />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of when to use this template" />
          </Form.Item>

          <Form.Item label="Visibility">
            <VisibilityToggle value={visibility} onChange={setVisibility} />
          </Form.Item>

          <Divider orientation="left">Clinical Findings</Divider>
          <FindingsEditor value={findings} onChange={setFindings} />

          <Divider orientation="left">Prescribing Instructions</Divider>
          <Form.Item name="instructions">
            <Input.TextArea rows={4} placeholder="Guidelines and instructions for prescribing (e.g., contraindications, monitoring)" />
          </Form.Item>

          <Divider orientation="left">Medications</Divider>
          <div style={{ marginBottom: 16 }}>
            <DrugSearch onSelect={handleDrugSelect} />
          </div>
          <DrugEntryForm value={drugItems} onChange={setDrugItems} />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {onCancel && (
              <Button onClick={onCancel}>Cancel</Button>
            )}
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </Form>
      </div>
    </Spin>
  );
}
