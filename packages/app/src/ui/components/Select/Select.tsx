import React, { useState, useRef, useEffect } from 'react';
import './Select.css';
import { Icon } from '../Icon/IconRegistry';

/**
 * Defines the structure for an individual option inside the Select component.
 */
export interface SelectOption {
  /** The technical value associated with the option */
  value: string;
  /** The display label shown to the user */
  label: string;
  /** Optional secondary details shown alongside the label */
  description?: string;
  /** Optional element rendered on the left side of the option */
  leftIcon?: React.ReactNode; 
  /** Optional element rendered on the right side of the option */
  rightIcon?: React.ReactNode; 
  /** Determines if the individual option is interactive */
  disabled?: boolean;
}

/**
 * Properties configuration for the Select component.
 */
interface SelectProps {
  /** List of options to be rendered inside the dropdown */
  options: SelectOption[];
  /** The currently selected value */
  value: string;
  /** Callback triggered when a new option is selected */
  onChange: (value: string) => void;
  /** Inline styles applied directly to the outer container */
  style?: React.CSSProperties;
  /** Custom class names to append to the outer container */
  className?: string; 
  /** If true, wraps long text labels instead of truncating them */
  wrapOptions?: boolean; 
  /** Controls where the dropdown menu opens relative to the trigger button */
  placement?: 'top' | 'bottom';
  /** If true, disables the entire component and prevents interaction */
  disabled?: boolean;
}

/**
 * A highly customizable dropdown select component designed for application settings and toolbars.
 */
export const Select: React.FC<SelectProps> = ({ 
  options, 
  value, 
  onChange, 
  style, 
  className = '', 
  wrapOptions = false, 
  placement = 'bottom',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Closes the dropdown menu automatically when clicking outside of the component boundaries
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
    <div 
      className={`ms-select-container ${className} ${disabled ? 'disabled' : ''}`} 
      ref={containerRef} 
      style={style}
    >
      {/* Trigger Button */}
      <div 
        className={`ms-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`} 
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
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
      {isOpen && !disabled && (
        <div className={`ms-select-dropdown ${placement}`}>
          {options.map((opt) => (
            <div 
              key={opt.value}
              className={`ms-select-option ${opt.value === value ? 'selected' : ''} ${wrapOptions ? 'wrap' : 'nowrap'} ${opt.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (opt.disabled) return;
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.leftIcon && <span className="ms-select-icon">{opt.leftIcon}</span>}
              
              {/* Layout adjustments: max-width is set dynamically to accommodate descriptions if present */}
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