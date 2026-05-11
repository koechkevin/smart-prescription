import React, { useEffect, useState } from 'react';
import { Card, Input, Select, Tag, Button, Empty, Pagination, Spin, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, SyncOutlined, CloseCircleFilled } from '@ant-design/icons';
import { useTemplateStore } from '../stores/templateStore';
import { ICD11Selector } from './ICD11Selector';
import { templateApi, drugApi } from '../services/api';
import type { PrescriptionTemplate, PrescriptionData } from '../types';

interface TemplateListProps {
  onCreateNew: () => void;
  onEdit: (template: PrescriptionTemplate) => void;
  onUseTemplate?: (data: PrescriptionData) => void;
  currentUserId?: string;
}

export function TemplateList({ onCreateNew, onEdit, onUseTemplate, currentUserId }: TemplateListProps) {
  const { templates = [], total, loading, page, limit, filters, setFilters, setPage, fetchTemplates, deleteTemplate } =
    useTemplateStore();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await drugApi.sync();
      message.success(`Drug catalog synced: ${res.data.added} added, ${res.data.updated} updated`);
    } catch (err: any) {
      message.error(err.message || 'Sync failed — ensure you have admin access');
    } finally {
      setSyncing(false);
    }
  };

  const handleUse = async (templateId: string) => {
    try {
      const res = await templateApi.use(templateId);
      onUseTemplate?.(res.data);
      message.success('Template applied');
    } catch (err: any) {
      message.error(err.message || 'Failed to apply template');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      message.success('Template deleted');
    } catch (err: any) {
      message.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Prescription Templates</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* <Button icon={<SyncOutlined spin={syncing} />} onClick={handleSync} loading={syncing}>
            Sync Drug Catalog
          </Button> */}
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
            New Template
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input.Search
          placeholder="Search templates..."
          allowClear
          style={{ width: 260 }}
          onSearch={(val) => setFilters({ search: val || undefined })}
        />
        <ICD11Selector
          value={filters.icd_code ? { code: filters.icd_code, description: '' } : undefined}
          onChange={(val) => setFilters({ icd_code: val?.code || undefined })}
        />
        {filters.icd_code && (
          <Button
            type="text"
            size="small"
            icon={<CloseCircleFilled />}
            onClick={() => setFilters({ icd_code: undefined })}
            style={{ color: '#999' }}
          />
        )}
        <Select
          placeholder="Visibility"
          allowClear
          style={{ width: 130 }}
          options={[
            { value: 'PUBLIC', label: 'Public' },
            { value: 'PRIVATE', label: 'My Private' },
          ]}
          onChange={(val) => setFilters({ visibility: val })}
        />
      </div>

      <Spin spinning={loading}>
        {templates.length === 0 && !loading ? (
          <Empty description="No templates found" />
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {templates.map((tpl) => (
              <Card key={tpl.id} size="small" hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{tpl.templateName}</span>
                      <Tag color={tpl.visibility === 'PUBLIC' ? 'green' : 'default'}>
                        {tpl.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                      </Tag>
                    </div>
                    <div style={{ color: '#666', fontSize: 13 }}>
                      <Tag color="blue">{tpl.icd11Code}</Tag>
                      {tpl.icd11Description && <span>{tpl.icd11Description}</span>}
                    </div>
                    <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
                      {tpl.drugItems.length} medication(s) &middot; {tpl.findings.length} finding(s)
                      {tpl.createdBy && <span> &middot; by {tpl.createdBy.name}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {onUseTemplate && (
                      <Button type="primary" size="small" icon={<PlayCircleOutlined />} onClick={() => handleUse(tpl.id)}>
                        Use
                      </Button>
                    )}
                    {currentUserId === tpl.createdById && (
                      <>
                        <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(tpl)} />
                        <Popconfirm title="Delete this template?" onConfirm={() => handleDelete(tpl.id)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Spin>

      {total > limit && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Pagination current={page} total={total} pageSize={limit} onChange={setPage} showSizeChanger={false} />
        </div>
      )}
    </div>
  );
}
