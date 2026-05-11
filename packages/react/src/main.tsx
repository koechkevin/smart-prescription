import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Button, Input, Form, Card, message, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { TemplateManager } from './components/TemplateManager';
import { PrescriptionModal } from './components/PrescriptionModal';
import type { PrescriptionData } from './types';
import './index.css';

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { email: values.email, password: values.password, name: values.name, role: 'PHYSICIAN' }
        : { email: values.email, password: values.password };

      const res = await fetch(`${window.location.origin}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        onLogin(data.data.token);
      } else {
        message.error(data.message || 'Authentication failed');
      }
    } catch {
      message.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 400 }} title={isRegister ? 'Create Account' : 'Sign In'}>
        <Form onFinish={handleSubmit} layout="vertical">
          {isRegister && (
            <Form.Item name="name" rules={[{ required: true, message: 'Required' }]}>
              <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
            </Form.Item>
          )}
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Required' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {isRegister ? 'Register' : 'Sign In'}
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleUseTemplate = (data: PrescriptionData) => {
    setPrescriptionData(data);
    setModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: '#4264D0', borderRadius: 8 } }}>
        <LoginForm onLogin={setToken} />
      </ConfigProvider>
    );
  }

  return (
    <>
      <div style={{ position: 'fixed', top: 12, right: 24, zIndex: 1000 }}>
        <Button size="small" onClick={handleLogout}>Logout</Button>
      </div>
      <TemplateManager
        apiBaseUrl={window.location.origin}
        authToken={token}
        onUseTemplate={handleUseTemplate}
        mode="standalone"
      />
      <PrescriptionModal
        open={modalOpen}
        data={prescriptionData}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
