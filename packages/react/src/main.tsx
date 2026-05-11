import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TemplateManager } from './components/TemplateManager';
import { PrescriptionModal } from './components/PrescriptionModal';
import type { PrescriptionData } from './types';
import './index.css';

const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM3OTZlMzhhLTU2MmItNGY5YS04ZDYxLTFmZjBhMjJkMDQyYyIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3Nzg0ODM2MTEsImV4cCI6MTc3OTA4ODQxMX0._brsSncy3PDxg0YSBrV97rGlaWfcKtS3ouf6jiYLPf0';

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
