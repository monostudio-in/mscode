// src/ui/components/Select/Select.tsx
import React, { useState, useRef, useEffect } from 'react';
import './Select.css';
import { Icon } from '../Icon/IconRegistry';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  leftIcon?: React.ReactNode; 
  rightIcon?: React.ReactNode; 
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  wrapOptions?: boolean; // true : text-tap, default false
  placement?: 'top' | 'bottom';
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, style, wrapOptions = false , placement = 'bottom'}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="ms-select-container" ref={containerRef} style={style}>
      {/* Trigger Button */}
      <div 
        className={`ms-select-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {selectedOption?.leftIcon && <span className="ms-select-icon">{selectedOption.leftIcon}</span>}
          <span className="ms-select-trigger-label" title={selectedOption?.label}>
            {selectedOption?.label}
          </span>
        </div>
        <Icon name="chevron-down" size={14} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`ms-select-dropdown ${placement}`}>
          {options.map((opt) => (
            <div 
              key={opt.value}
              className={`ms-select-option ${opt.value === value ? 'selected' : ''} ${wrapOptions ? 'wrap' : 'nowrap'}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.leftIcon && <span className="ms-select-icon">{opt.leftIcon}</span>}
              
              {/* maxWidth : description->80% ,  without description->100% */}
              <span 
                className="ms-select-option-label" 
                title={opt.label}
                style={{ maxWidth: wrapOptions ? 'none' : (opt.description ? '80%' : '100%') }}
              >
                {opt.label}
              </span>
              
              {opt.description && (
                <span className="ms-select-option-desc" title={opt.description}>
                  {opt.description}
                </span>
              )}

              {opt.rightIcon && <span className="ms-select-icon right">{opt.rightIcon}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};