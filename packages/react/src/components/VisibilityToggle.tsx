import React from 'react';
import { Switch, Typography } from 'antd';
import { LockOutlined, GlobalOutlined } from '@ant-design/icons';
import type { Visibility } from '../types';

interface VisibilityToggleProps {
  value?: Visibility;
  onChange?: (value: Visibility) => void;
}

export function VisibilityToggle({ value = 'PRIVATE', onChange }: VisibilityToggleProps) {
  const isPublic = value === 'PUBLIC';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {isPublic ? <GlobalOutlined style={{ color: '#17B26A' }} /> : <LockOutlined style={{ color: '#666' }} />}
      <Switch
        checked={isPublic}
        onChange={(checked) => onChange?.(checked ? 'PUBLIC' : 'PRIVATE')}
        checkedChildren="Public"
        unCheckedChildren="Private"
      />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {isPublic ? 'All doctors can view and use this template' : 'Only you can view and use this template'}
      </Typography.Text>
    </div>
  );
}
