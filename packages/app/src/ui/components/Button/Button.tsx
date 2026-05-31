// src/ui/components/Button/Button.tsx
import React from 'react';
import './Button.css';

export interface ButtonSplitProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: React.ReactNode;
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'type1' | 'type2';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  narrow?: boolean;
  radius?: string;
  customStyle?: React.CSSProperties;
  
  // Dynamic Split Support
  splits?: ButtonSplitProps[];
  splitRatios?: number[];        // e.g. [6, 1] or [1, 3, 1]
  splitGap?: string | number;    // e.g. '1px'
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'type2', icon, iconPosition = 'left',
  fullWidth = false, narrow = false, radius, customStyle, className = '',
  splits, splitRatios, splitGap = '1px',
  ...props
}) => {
  // ── Render Split Layout ─────────────────────────────────────────
  if (splits && splits.length > 0) {
    const gridTemplateColumns = splitRatios 
      ? splitRatios.map(r => `${r}fr`).join(' ') 
      : splits.map(() => '1fr').join(' '); // Default 1:1

    const containerClasses = [
      'ms-btn-split-container',
      `ms-btn-${variant === 'type1' ? 'type-1' : 'type-2'}`,
      fullWidth ? 'ms-btn-full-width' : '',
      className
    ].join(' ');

    return (
      <div
        className={containerClasses}
        style={{
          gridTemplateColumns,
          gap: splitGap,
          borderRadius: radius || (variant === 'type1' ? '1px' : '2px'),
          ...customStyle
        }}
      >
        {splits.map((split, idx) => (
          <button
            key={idx}
            className={`ms-btn-split-segment ${split.className || ''}`}
            onClick={split.onClick}
            disabled={split.disabled || props.disabled}
            title={split.title}
            style={split.style}
          >
            {split.icon && split.iconPosition !== 'right' && split.icon}
            {split.label}
            {split.children}
            {split.icon && split.iconPosition === 'right' && split.icon}
          </button>
        ))}
      </div>
    );
  }

  // ── Render Normal Button ────────────────────────────────────────
  const classes = [
    'ms-btn',
    `ms-btn-${variant === 'type1' ? 'type-1' : 'type-2'}`,
    fullWidth ? 'ms-btn-full-width' : '',
    className
  ].join(' ');

  const finalStyle: React.CSSProperties = {
    borderRadius: radius || (variant === 'type1' ? '1px' : '2px'),
    padding: narrow ? '4px 8px' : '6px 12px',
    ...customStyle
  };

  return (
    <button className={classes} style={finalStyle} {...props}>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
};