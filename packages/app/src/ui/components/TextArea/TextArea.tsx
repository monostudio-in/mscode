import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea: React.FC<TextAreaProps> = ({ style, ...props }) => {
  return (
    <textarea 
      {...props}
      style={{
        width: '100%',
        backgroundColor: 'var(--ms-input-bg)',
        color: 'var(--ms-input-fg)',
        border: '1px solid var(--ms-input-border)',
        padding: '6px 8px',
        fontSize: '13px',
        borderRadius: '2px',
        outline: 'none',
        fontFamily: 'monospace',
        resize: 'vertical',
        minHeight: '60px',
        ...style
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--ms-input-focus-border)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--ms-input-border)'}
    />
  );
};