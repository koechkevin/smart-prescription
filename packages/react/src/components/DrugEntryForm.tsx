import React from 'react';
import { Input, Select, InputNumber, Button, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { TemplateDrugItem, DurationUnit } from '../types';

const DURATION_UNITS: { value: DurationUnit; label: string }[] = [
  { value: 'DAYS', label: 'Days' },
  { value: 'WEEKS', label: 'Weeks' },
  { value: 'MONTHS', label: 'Months' },
];

const ROUTES = [
  'Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous',
  'Topical', 'Inhalation', 'Rectal', 'Sublingual', 'Ophthalmic',
];

interface DrugEntryFormProps {
  value?: TemplateDrugItem[];
  onChange?: (items: TemplateDrugItem[]) => void;
}

export function DrugEntryForm({ value = [], onChange }: DrugEntryFormProps) {
  const updateItem = (index: number, field: keyof TemplateDrugItem, val: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange?.(updated);
  };

  const removeItem = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'Drug',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 200,
      render: (text: string) => <span style={{ fontWeight: 500, fontSize: 13 }}>{text}</span>,
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
      width: 140,
      render: (_: string, __: any, index: number) => (
        <Input
          placeholder="e.g., 500mg"
          value={value[index]?.dosage}
          onChange={(e) => updateItem(index, 'dosage', e.target.value)}
        />
      ),
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 160,
      render: (_: string, __: any, index: number) => (
        <Input
          placeholder="e.g., 3x daily"
          value={value[index]?.frequency}
          onChange={(e) => updateItem(index, 'frequency', e.target.value)}
        />
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 180,
      render: (_: any, __: any, index: number) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <InputNumber
            min={1}
            placeholder="5"
            value={value[index]?.duration}
            onChange={(val) => updateItem(index, 'duration', val)}
            style={{ width: 70 }}
          />
          <Select
            value={value[index]?.durationUnit || 'DAYS'}
            onChange={(val) => updateItem(index, 'durationUnit', val)}
            options={DURATION_UNITS}
            style={{ width: 100 }}
          />
        </div>
      ),
    },
    {
      title: 'Route',
      key: 'route',
      width: 150,
      render: (_: any, __: any, index: number) => (
        <Select
          placeholder="Route"
          value={value[index]?.routeOfAdministration}
          onChange={(val) => updateItem(index, 'routeOfAdministration', val)}
          options={ROUTES.map((r) => ({ value: r, label: r }))}
          style={{ width: '100%' }}
          allowClear
        />
      ),
    },
    {
      title: 'Instructions',
      key: 'instructions',
      width: 180,
      render: (_: any, __: any, index: number) => (
        <Input
          placeholder="Special instructions"
          value={value[index]?.instructions}
          onChange={(e) => updateItem(index, 'instructions', e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 48,
      render: (_: any, __: any, index: number) => (
        <Button icon={<DeleteOutlined />} type="text" danger onClick={() => removeItem(index)} />
      ),
    },
  ];

  if (value.length === 0) {
    return <div className="text-gray-400 text-center py-4">No drugs added. Use the search above to add medications.</div>;
  }

  return (
    <Table
      dataSource={value.map((item, i) => ({ ...item, key: i }))}
      columns={columns}
      pagination={false}
      size="middle"
      scroll={{ x: 1050 }}
    />
  );
}
