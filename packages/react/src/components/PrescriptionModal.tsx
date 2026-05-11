import React, { useState } from 'react';
import { Modal, Input, Tag, Table, Divider, Button, Form, DatePicker, message } from 'antd';
import { PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { PrescriptionData } from '../types';

interface PrescriptionModalProps {
  open: boolean;
  data: PrescriptionData | null;
  onClose: () => void;
}

export function PrescriptionModal({ open, data, onClose }: PrescriptionModalProps) {
  const [form] = Form.useForm();
  const [prescribed, setPrescribed] = useState(false);

  if (!data) return null;

  const handlePrescribe = async () => {
    try {
      await form.validateFields();
      setPrescribed(true);
      message.success('Prescription created successfully');
    } catch {
      // validation errors shown inline
    }
  };

  const handleClose = () => {
    form.resetFields();
    setPrescribed(false);
    onClose();
  };

  const drugColumns = [
    {
      title: '#',
      key: 'index',
      width: 40,
      render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: 'Medication',
      dataIndex: 'drugName',
      key: 'drugName',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.instructions && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{record.instructions}</div>}
        </div>
      ),
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
      width: 120,
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 130,
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      render: (_: any, record: any) =>
        record.duration ? `${record.duration} ${(record.durationUnit || 'DAYS').toLowerCase()}` : '—',
    },
    {
      title: 'Route',
      dataIndex: 'routeOfAdministration',
      key: 'route',
      width: 110,
    },
  ];

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={780}
      styles={{ body: { padding: '0 24px 24px' } }}
      destroyOnHidden
    >
      <div style={{ borderBottom: '2px solid #4264D0', paddingBottom: 12, marginBottom: 16, paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Prescription</h2>
            <div style={{ marginTop: 4, color: '#666', fontSize: 13 }}>
              Template: <strong>{data.templateName}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>{data.icd11Code}</Tag>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{data.icd11Description}</div>
          </div>
        </div>
      </div>

      {prescribed ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Prescription Created</h3>
          <p style={{ color: '#666' }}>
            Patient: <strong>{form.getFieldValue('patientName')}</strong>
          </p>
          <p style={{ color: '#666', marginBottom: 24 }}>
            {data.items.length} medication(s) prescribed
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>
            <Button type="primary" onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <>
          <Form form={form} layout="vertical" size="middle">
            <Divider orientation="left" style={{ fontSize: 14, marginTop: 0 }}>Patient Information</Divider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="patientName" label="Patient Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item name="patientId" label="Patient ID / File No.">
                <Input placeholder="e.g., MRN-001234" />
              </Form.Item>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Form.Item name="age" label="Age">
                <Input placeholder="e.g., 35 yrs" />
              </Form.Item>
              <Form.Item name="weight" label="Weight (kg)">
                <Input placeholder="e.g., 70" />
              </Form.Item>
              <Form.Item name="date" label="Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {data.findings.length > 0 && (
              <>
                <Divider orientation="left" style={{ fontSize: 14 }}>Clinical Findings</Divider>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {data.findings.map((f, i) => (
                    <Form.Item
                      key={i}
                      name={`finding_${i}`}
                      label={<span>{f.finding} <Tag style={{ fontSize: 11 }}>{f.findingType}</Tag>{f.isRequired && <span style={{ color: '#ff4d4f' }}> *</span>}</span>}
                      rules={f.isRequired ? [{ required: true, message: 'Required' }] : []}
                    >
                      <Input placeholder={`Enter ${f.finding.toLowerCase()}`} />
                    </Form.Item>
                  ))}
                </div>
              </>
            )}
          </Form>

          <Divider orientation="left" style={{ fontSize: 14 }}>Medications ({data.items.length})</Divider>
          <Table
            dataSource={data.items.map((item, i) => ({ ...item, key: i }))}
            columns={drugColumns}
            pagination={false}
            size="middle"
            bordered
          />

          {data.instructions && (
            <>
              <Divider orientation="left" style={{ fontSize: 14 }}>Instructions</Divider>
              <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, fontSize: 13, color: '#333', whiteSpace: 'pre-wrap' }}>
                {data.instructions}
              </div>
            </>
          )}

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" onClick={handlePrescribe} size="large">
              Prescribe
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
