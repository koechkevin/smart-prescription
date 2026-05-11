import React from 'react';
import { Descriptions, Tag, Table, Card, Typography } from 'antd';
import type { PrescriptionTemplate } from '../types';

interface TemplateDetailProps {
  template: PrescriptionTemplate;
}

export function TemplateDetail({ template }: TemplateDetailProps) {
  const drugColumns = [
    { title: 'Drug', dataIndex: 'drugName', key: 'drugName' },
    { title: 'Dosage', dataIndex: 'dosage', key: 'dosage' },
    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
    { title: 'Duration', key: 'duration', render: (_: any, r: any) => r.duration ? `${r.duration} ${r.durationUnit}` : '-' },
    { title: 'Route', dataIndex: 'routeOfAdministration', key: 'route' },
    { title: 'Instructions', dataIndex: 'instructions', key: 'instructions' },
  ];

  return (
    <div>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Template Name">{template.templateName}</Descriptions.Item>
        <Descriptions.Item label="ICD-11 Code">
          <Tag color="blue">{template.icd11Code}</Tag> {template.icd11Description}
        </Descriptions.Item>
        <Descriptions.Item label="Visibility">
          <Tag color={template.visibility === 'PUBLIC' ? 'green' : 'default'}>{template.visibility}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created By">{template.createdBy?.name}</Descriptions.Item>
        {template.description && (
          <Descriptions.Item label="Description" span={2}>{template.description}</Descriptions.Item>
        )}
      </Descriptions>

      {template.findings.length > 0 && (
        <Card title="Clinical Findings" size="small" style={{ marginTop: 16 }}>
          {template.findings.map((f, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <Tag>{f.findingType}</Tag>
              <span>{f.finding}</span>
              {f.isRequired && <Tag color="red" style={{ marginLeft: 8 }}>Required</Tag>}
            </div>
          ))}
        </Card>
      )}

      {template.instructions && (
        <Card title="Prescribing Instructions" size="small" style={{ marginTop: 16 }}>
          <Typography.Paragraph>{template.instructions}</Typography.Paragraph>
        </Card>
      )}

      <Card title="Medications" size="small" style={{ marginTop: 16 }}>
        <Table
          dataSource={template.drugItems.map((d, i) => ({ ...d, key: i }))}
          columns={drugColumns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
