import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TemplateManager } from './components/TemplateManager';
import { PrescriptionModal } from './components/PrescriptionModal';
import type { PrescriptionData } from './types';
import './index.css';

const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU0YTUzYWZiLTMzNWQtNGZiZC04YjVjLWM5MTM3NjIxZTRiMiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3Nzg0OTYyMTEsImV4cCI6MTc3OTEwMTAxMX0.wmUX9Sfyw7U8f0_tM6b23u2w5o7_IjGkY1IuyzpD3Y4';

if (!localStorage.getItem('token')) {
  localStorage.setItem('token', DEV_TOKEN);
}

function App() {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleUseTemplate = (data: PrescriptionData) => {
    setPrescriptionData(data);
    setModalOpen(true);
  };

  return (
    <>
      <TemplateManager
        apiBaseUrl={window.location.origin}
        authToken={localStorage.getItem('token') || ''}
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
