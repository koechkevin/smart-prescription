import React, { useCallback } from 'react';
import { AutoComplete, Input } from 'antd';
import { MedicineBoxOutlined } from '@ant-design/icons';
import { useDrugSearchStore } from '../stores/drugSearchStore';
import type { DrugCatalogItem } from '../types';

interface DrugSearchProps {
  onSelect: (drug: DrugCatalogItem) => void;
}

export function DrugSearch({ onSelect }: DrugSearchProps) {
  const { results, searching, searchDrugs, clear } = useDrugSearchStore();
  const [inputValue, setInputValue] = React.useState('');
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setInputValue(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDrugs(text), 300);
  }, [searchDrugs]);

  const handleSelect = (_: string, option: any) => {
    const drug: DrugCatalogItem = option.data;
    onSelect(drug);
    setInputValue('');
    clear();
  };

  const options = results.map((drug) => ({
    value: `${drug.genericConceptCode} - ${drug.genericName}`,
    label: (
      <div>
        <div className="font-medium">{drug.genericName}</div>
        <div className="text-xs text-gray-500">
          {[drug.strength, drug.dosageForm, drug.route].filter(Boolean).join(' | ')}
        </div>
      </div>
    ),
    data: drug,
  }));

  return (
    <AutoComplete
      value={inputValue}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      style={{ width: '100%' }}
    >
      <Input
        prefix={<MedicineBoxOutlined />}
        placeholder="Search PPB drug catalog (e.g., amoxicillin, paracetamol)"
        allowClear
        suffix={searching ? <span className="ant-input-suffix-loading" /> : undefined}
      />
    </AutoComplete>
  );
}
