import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { initApi } from '../services/api';
import { TemplateList } from './TemplateList';
import { TemplateForm } from './TemplateForm';
import type { TemplateManagerProps, PrescriptionTemplate } from '../types';

type View = 'list' | 'create' | 'edit';

export function TemplateManager({ apiBaseUrl, authToken, onUseTemplate, mode = 'standalone', initialIcdCode, userId }: TemplateManagerProps) {
  const [view, setView] = useState<View>('list');
  const [editingTemplate, setEditingTemplate] = useState<PrescriptionTemplate | undefined>();

  useEffect(() => {
    initApi(apiBaseUrl, authToken);
  }, [apiBaseUrl, authToken]);

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setView('create');
  };

  const handleEdit = (template: PrescriptionTemplate) => {
    setEditingTemplate(template);
    setView('edit');
  };

  const handleSaved = () => {
    setView('list');
    setEditingTemplate(undefined);
  };

  const handleCancel = () => {
    setView('list');
    setEditingTemplate(undefined);
  };

  const content = (() => {
    switch (view) {
      case 'create':
        return <TemplateForm onSaved={handleSaved} onCancel={handleCancel} />;
      case 'edit':
        return <TemplateForm template={editingTemplate} onSaved={handleSaved} onCancel={handleCancel} />;
      default:
        return (
          <TemplateList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onUseTemplate={onUseTemplate}
            currentUserId={userId}
          />
        );
    }
  })();

  const containerStyle = mode === 'standalone' ? { padding: 24, maxWidth: 1100, margin: '0 auto' } : {};

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4264D0', borderRadius: 8 } }}>
      <div style={containerStyle}>
        {content}
      </div>
    </ConfigProvider>
  );
}
