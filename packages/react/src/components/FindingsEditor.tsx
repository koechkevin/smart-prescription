import React from 'react';
import { Button, Input, Select, Checkbox, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TemplateFinding, FindingType } from '../types';

const FINDING_TYPES: { value: FindingType; label: string }[] = [
  { value: 'OBSERVATION', label: 'Observation' },
  { value: 'SYMPTOM', label: 'Symptom' },
  { value: 'SIGN', label: 'Sign' },
  { value: 'VITAL', label: 'Vital' },
  { value: 'LAB_RESULT', label: 'Lab Result' },
];

interface FindingsEditorProps {
  value?: TemplateFinding[];
  onChange?: (findings: TemplateFinding[]) => void;
}

export function FindingsEditor({ value = [], onChange }: FindingsEditorProps) {
  const addFinding = () => {
    onChange?.([...value, { finding: '', findingType: 'OBSERVATION', isRequired: false }]);
  };

  const updateFinding = (index: number, field: keyof TemplateFinding, val: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange?.(updated);
  };

  const removeFinding = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      {value.map((finding, index) => (
        <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <Input
            placeholder="Finding (e.g., Temperature)"
            value={finding.finding}
            onChange={(e) => updateFinding(index, 'finding', e.target.value)}
            style={{ flex: 2 }}
          />
          <Select
            value={finding.findingType}
            onChange={(val) => updateFinding(index, 'findingType', val)}
            options={FINDING_TYPES}
            style={{ width: 130 }}
          />
          <Checkbox
            checked={finding.isRequired}
            onChange={(e) => updateFinding(index, 'isRequired', e.target.checked)}
          >
            Required
          </Checkbox>
          <Button icon={<DeleteOutlined />} type="text" danger onClick={() => removeFinding(index)} />
        </div>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} onClick={addFinding} block>
        Add Finding
      </Button>
    </div>
  );
}
