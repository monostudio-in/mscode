// src/ui/components/InputBox/InputBox.tsx
import React from 'react';
import './InputBox.css';

/**
 * Configuration interface for the MS Code Native InputBox component.
 */
export interface InputBoxProps {
  /** The current controlled string value of the input field. */
  value: string;

  /**
   * Callback fired triggered immediately when the input text changes.
   * @param val The updated string value from the element.
   */
  onChange: (val: string) => void;

  /** Ghost placeholder text displayed when the input value is empty. */
  placeholder?: string;
  
  /** * **Zone 1:** Icon rendered outside the input block on the far-left side.
   * Ideal for section anchors or structural labels.
   */
  leftOutsideIcon?: React.ReactNode;

  /** * **Zone 2:** Action or descriptive icon embedded inside the input frame on the left.
   * @example <Icon name="search" />
   */
  leftInsideIcon?: React.ReactNode;

  /** * **Zone 3:** Icons layout stacked inside the input frame on the far-right side.
   * Perfect for control triggers like Regex toggles, Match Case, or Clear actions.
   */
  rightInsideIcons?: React.ReactNode;

  /** * **Zone 4:** Icon layout positioned completely outside the input wrapper on the far-right.
   * Recommended for action triggers like "Go", "Submit", or return buttons.
   */
  rightOutsideIcons?: React.ReactNode;
  
  /** @deprecated Legacy fallback prop. Use `leftOutsideIcon` instead. */
  leftIcon?: React.ReactNode;
  /** @deprecated Legacy fallback prop. Use `rightInsideIcons` instead. */
  insideIcons?: React.ReactNode;
  /** @deprecated Legacy fallback prop. Use `rightOutsideIcons` instead. */
  outsideIcons?: React.ReactNode;
}

/**
 * Native MS Code Input Box container supporting fully customizable 4-Zone icon placement layouts.
 * Seamlessly matches global platform themes and scaling variables.
 * * @example
 * ```tsx
 * const { InputBox } = mscode.ui.components;
 * * <InputBox 
 * value={searchQuery} 
 * onChange={setSearchQuery} 
 * placeholder="Search files..."
 * leftInsideIcon={<Icon name="search" />}
 * rightInsideIcons={<Icon name="regex" />}
 * />
 * ```
 */
export const InputBox: React.FC<InputBoxProps> = ({ 
  value, onChange, placeholder, 
  leftOutsideIcon, leftInsideIcon, rightInsideIcons, rightOutsideIcons,
  leftIcon, insideIcons, outsideIcons 
}) => {
  return (
    <div className="ms-inputbox-container">
      {/* 1. Outside Left Icon */}
      {(leftOutsideIcon || leftIcon) && (
        <div className="ms-inputbox-outside-left">
          {leftOutsideIcon || leftIcon}
        </div>
      )}

      {/* Input Box Wrapper */}
      <div className="ms-inputbox-wrapper">
        
        {/* 2. Inside Left Icon */}
        {leftInsideIcon && (
          <div className="ms-inputbox-inside-left">
            {leftInsideIcon}
          </div>
        )}
        
        <input 
          className="ms-inputbox-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: leftInsideIcon ? '4px' : '6px' }}
        />
        
        {/* 3. Inside Right Icons */}
        {(rightInsideIcons || insideIcons) && (
          <div className="ms-inputbox-inside-right">
            {rightInsideIcons || insideIcons}
          </div>
        )}
      </div>

      {/* 4. Outside Right Icons */}
      {(rightOutsideIcons || outsideIcons) && (
        <div className="ms-inputbox-outside-right">
          {rightOutsideIcons || outsideIcons}
        </div>
      )}
    </div>
  );
};

/**
 * Helper interactive wrapper designed for structural icons inside an InputBox context.
 */
export const InputAction: React.FC<{ 
  /** Icon element to render inside the button frame. */
  icon: React.ReactNode; 
  /** Toggles active UI state styles (e.g., selected filters/regex mode). */
  active?: boolean; 
  /** Click action event capture callback. */
  onClick?: (e: React.MouseEvent) => void 
}> = ({ icon, active, onClick }) => (
  <div className={`ms-inputbox-action-icon ${active ? 'active' : ''}`} onClick={onClick}>
    {icon}
  </div>
);