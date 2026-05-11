import React, { useState, useRef, useCallback } from 'react';
import { Button, Tag, Modal, Input, List, Spin, Empty } from 'antd';
import { EditOutlined, MedicineBoxOutlined, SearchOutlined } from '@ant-design/icons';
import { icdApi } from '../services/api';
import type { ICD11Result } from '../types';

interface ICD11SelectorProps {
  value?: { code: string; description: string };
  onChange?: (value: { code: string; description: string }) => void;
}

export function ICD11Selector({ value, onChange }: ICD11SelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ICD11Result[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await icdApi.search(q);
        setResults(res.data?.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const handleSelect = (item: ICD11Result) => {
    onChange?.({ code: item.code, description: item.title });
    setModalOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value?.code ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>{value.code}</Tag>
            <span style={{ color: '#333', fontSize: 13 }}>{value.description}</span>
          </div>
        ) : (
          <span style={{ color: '#999', fontSize: 13, flex: 1 }}>No diagnosis selected</span>
        )}
        <Button
          icon={value?.code ? <EditOutlined /> : <MedicineBoxOutlined />}
          onClick={() => setModalOpen(true)}
          type={value?.code ? 'default' : 'primary'}
        >
          {value?.code ? 'Change' : 'Select Diagnosis'}
        </Button>
      </div>

      <Modal
        title="ICD-11 — Search & Select Diagnosis"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setQuery(''); setResults([]); }}
        footer={null}
        width={640}
        styles={{ body: { padding: '16px 24px' } }}
        destroyOnHidden
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="Type to search (e.g. malaria, diabetes, hypertension...)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          size="large"
          autoFocus
          allowClear
        />
        <div style={{ marginTop: 12, maxHeight: '55vh', overflowY: 'auto' }}>
          {searching ? (
            <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
          ) : results.length > 0 ? (
            <List
              dataSource={results}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '10px 12px' }}
                  onClick={() => handleSelect(item)}
                >
                  <List.Item.Meta
                    title={<><Tag color="blue">{item.code}</Tag> {item.title}</>}
                  />
                </List.Item>
              )}
            />
          ) : query.length >= 2 ? (
            <Empty description="No results found" style={{ padding: 32 }} />
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: 32 }}>
              Start typing to search ICD-11 diagnoses
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
