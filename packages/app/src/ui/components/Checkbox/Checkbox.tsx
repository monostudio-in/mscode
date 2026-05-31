import React from 'react';
import './Checkbox.css';
import { Icon } from '../Icon/IconRegistry';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label }) => (
  <label className="ms-checkbox-wrapper">
    <input 
      type="checkbox" 
      className="ms-checkbox-input"
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} 
    />
    <div className="ms-checkbox-box">
      {checked && <Icon name="check" size={14} color="var(--ms-text-bright)" />}
    </div>
    {label && <span style={{ color: 'var(--ms-text-main)', fontSize: '13px' }}>{label}</span>}
  </label>
);