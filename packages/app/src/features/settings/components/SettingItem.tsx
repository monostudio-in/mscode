// src/features/settings/components/SettingItem.tsx

import React, { memo } from 'react';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import type { SettingDefinition } from '@/core/extensionAPI/registry/configurationRegistry';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Select } from '@/ui/components/Select/Select';
import { InputBox } from '@/ui/components/InputBox/InputBox';
import { TextArea } from '@/ui/components/TextArea/TextArea';
import { RichText } from '@/ui/components/RichText/RichText';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import "./SettingItem.css";

/**
 * Interface parameter boundary mapping control callbacks and reactive item arrays 
 * managed inside the primitive configuration values array builder.
 */
interface ArrayEditorProps {
  value: unknown;
  onChange: (value: string[]) => void;
}

/**
 * Isolated row items value builder component designed for managing string configuration collections
 * within clean vector schemas without manually modifying full text block representations.
 */
const ArrayEditor: React.FC<ArrayEditorProps> = ({ value, onChange }) => {
  const items = Array.isArray(value) ? (value as string[]) : [];

  const handleUpdate = (idx: number, newVal: string) => {
    const newArr = [...items];
    newArr[idx] = newVal;
    onChange(newArr);
  };

  const handleRemove = (idx: number) => {
    const newArr = items.filter((_, i) => i !== idx);
    onChange(newArr);
  };

  const handleAdd = () => {
    if (items.length > 0 && items[items.length - 1] === '') return;
    onChange([...items, '']);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', maxWidth: '400px' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            value={item}
            onChange={(e) => handleUpdate(idx, e.target.value)}
            style={{
              flex: 1, 
              background: 'var(--ms-bg-main)', 
              color: 'var(--ms-text-main)',
              border: '1px solid var(--ms-border-light)', 
              outline: 'none', 
              padding: '4px 8px',
              fontSize: '13px', 
              borderRadius: '2px'
            }}
          />
          <div 
            onClick={() => handleRemove(idx)} 
            style={{ cursor: 'pointer', opacity: 0.6, display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <Icon name="close" size={14} />
          </div>
        </div>
      ))}
      <button
        onClick={handleAdd}
        disabled={items.length > 0 && items[items.length - 1] === ''}
        style={{
          marginTop: '4px', 
          background: 'transparent', 
          border: '1px dashed var(--ms-border-dark)',
          color: 'var(--ms-text-main)', 
          padding: '6px 12px', 
          cursor: 'pointer', 
          fontSize: '12px',
          borderRadius: '2px', 
          opacity: (items.length > 0 && items[items.length - 1] === '') ? 0.4 : 0.8, 
          textAlign: 'center'
        }}
      >
        + Add Item
      </button>
    </div>
  );
};

interface SettingItemProps {
  setting: SettingDefinition;
}

/**
 * Core dynamic configuration sheet renderer that matches schema targets to specialized 
 * control items while parsing dynamic template tokens from the application state store.
 */
export const SettingItem: React.FC<SettingItemProps> = memo(({ setting }) => {
  const value = useSettingsStore(
    state => state.settings[setting.id] ?? setting.defaultValue ?? (setting as any).default
  );
  
  const allSettings = useSettingsStore(state => state.settings);
  const updateSetting = useSettingsStore(state => state.updateSetting);

  const handleChange = (val: unknown) => updateSetting(setting.id, val);
  
  let displayDescription = (setting as any).markdownDescription || setting.description || '';

  if (displayDescription.includes('${')) {
    displayDescription = displayDescription.replace(/\$\{([^}]+)\}/g, (match: string, settingKey: string) => {
      const replacementValue = allSettings[settingKey];
      return replacementValue !== undefined ? String(replacementValue) : match;
    });
  }

  const handleLinkClick = (targetId: string) => {
    const el = document.getElementById(`setting-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'background-color 0.3s';
      el.style.backgroundColor = 'var(--ms-activity-hover)';
      setTimeout(() => {
        el.style.backgroundColor = 'transparent';
      }, 1500);
    }
  };

  const renderControl = () => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ paddingTop: '2px' }}>
              <Checkbox checked={!!value} onChange={handleChange} />
            </div>
            <div style={{ color: 'var(--ms-settings-desc-color)', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>
              <RichText text={displayDescription} onLinkClick={handleLinkClick} />
            </div>
          </div>
        );
      case 'select':
        const selectedOption = setting.options?.find(opt => String(opt.value) === String(value));
        const optionDescription = (selectedOption as any)?.markdownDescription || selectedOption?.description;
        return (
          <div style={{ marginTop: '8px', maxWidth: '300px' }}>
            <Select 
              options={setting.options || setting.enum?.map(e => ({ value: String(e), label: String(e) })) || []} 
              value={String(value)} 
              onChange={handleChange} 
            />
            {optionDescription && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '6px', 
                marginTop: '8px', 
                color: 'var(--ms-code-fg)', 
                fontStyle: 'italic', 
                fontSize: '12px', 
                opacity: 0.9 
              }}>
                <span style={{ marginTop: '2px', minWidth: '14px', display: 'flex' }}>
                  <Icon name="info" size={14} />
                </span>
                <RichText text={optionDescription} onLinkClick={handleLinkClick} />
              </div>
            )}
          </div>
        );
      case 'number':
      case 'string':
        return (
          <div style={{ marginTop: '8px', maxWidth: '300px' }}>
            <InputBox 
              value={String(value)} 
              onChange={(val) => handleChange(setting.type === 'string' ? val : (Number(val) || 0))} 
            />
          </div>
        );
      
      case 'array': {
        const fallbackDefault = setting.defaultValue ?? (setting as any).default;
        const firstItem = (Array.isArray(value) && value.length > 0) ? value[0] : 
                          (Array.isArray(fallbackDefault) && fallbackDefault.length > 0) ? fallbackDefault[0] : null;
        
        const isComplexArray = typeof firstItem === 'object' && firstItem !== null;

        if (isComplexArray) {
          return (
            <div style={{ marginTop: '8px', maxWidth: '600px' }}>
              <TextArea 
                value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)} 
                onChange={(e) => {
                  const text = e.target.value;
                  try { 
                    handleChange(JSON.parse(text)); 
                  } catch (err) { 
                    handleChange(text); 
                  }
                }} 
              />
              <div style={{ fontSize: '11px', color: 'var(--ms-text-faded)', marginTop: '4px', fontStyle: 'italic' }}>
                Edit as JSON array. Make sure the format is valid.
              </div>
            </div>
          );
        }

        return <ArrayEditor value={value} onChange={handleChange} />;
      }
        
      case 'object':
        return (
          <div style={{ marginTop: '8px', maxWidth: '600px' }}>
            <TextArea 
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)} 
              onChange={(e) => {
                const text = e.target.value;
                try { 
                  handleChange(JSON.parse(text)); 
                } catch (err) { 
                  handleChange(text); 
                }
              }} 
            />
            <div style={{ fontSize: '11px', color: 'var(--ms-text-faded)', marginTop: '4px', fontStyle: 'italic' }}>
              Edit as JSON object. Make sure the format is valid.
            </div>
          </div>
        );
      default: 
        return null;
    }
  };

  return (
    <div id={`setting-${setting.id}`} style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', color: 'var(--ms-settings-title-color)', fontWeight: '600' }}>
          {setting.title || setting.label || setting.id}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--ms-text-faded)', fontFamily: 'monospace', opacity: 0.6 }}>
          {setting.id}
        </span>
        {(setting as any).experimental && (
          <span style={{ 
            fontSize: '10px', 
            backgroundColor: 'rgba(0, 122, 204, 0.2)', 
            color: '#3794ff', 
            padding: '2px 6px', 
            borderRadius: '10px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase' 
          }}>
            Experimental
          </span>
        )}
      </div>
      {renderControl()}
      {setting.type !== 'boolean' && (
        <div style={{ color: 'var(--ms-settings-desc-color)', fontSize: '13px', marginTop: '4px' }}>
          <RichText text={displayDescription} onLinkClick={handleLinkClick} />
        </div>
      )}
    </div>
  );
});
