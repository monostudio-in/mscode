import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RichTextProps {
  text?: string;
  onLinkClick?: (target: string) => void;
}

export const RichText: React.FC<RichTextProps> = ({ text = '', onLinkClick }) => {
  if (!text) return null;

  //  #setting# format -> [ #setting# ](#setting)
  const preprocessedText = text.replace(/`?#([a-zA-Z0-9.-]+)#`?/g, '[`#$1`](#$1)');

  return (
    <div style={{ lineHeight: '1.5', color: 'var(--ms-settings-desc-color)' }} className="markdown-body">
      
      <style>{`
        .markdown-body a code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
        }
      `}</style>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            return (
              <code style={{ backgroundColor: 'var(--ms-code-bg)', color: 'var(--ms-code-fg)', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12.5px' }} {...props}>
                {children}
              </code>
            );
          },
          a({ node, href, children, ...props }) {
            const isInternal = href?.startsWith('#');
            return (
              <a
                href={href}
                onClick={(e) => {
                  if (isInternal) {
                    e.preventDefault();
                    if (onLinkClick && href) onLinkClick(href.replace('#', ''));
                  }
                }}
                style={{ color: 'var(--ms-settings-link-color)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                {...props}
              >
                {children}
              </a>
            );
          },
          p({ children }) { return <p style={{ margin: '0 0 8px 0' }}>{children}</p>; },
          table({ children }) { return <table style={{ borderCollapse: 'collapse', width: '100%', margin: '8px 0', fontSize: '13px' }}>{children}</table>; },
          th({ children }) { return <th style={{ borderBottom: '1px solid var(--ms-border-light)', padding: '6px', textAlign: 'left', fontWeight: '600' }}>{children}</th>; },
          td({ children }) { return <td style={{ borderBottom: '1px solid var(--ms-border-light)', padding: '6px', textAlign: 'left' }}>{children}</td>; },
          blockquote({ children }) {
            return <blockquote style={{ margin: '8px 0', paddingLeft: '10px', borderLeft: '3px solid var(--ms-accent-color)', color: 'var(--ms-text-faded)', fontStyle: 'italic' }}>{children}</blockquote>;
          }
        }}
      >
        {preprocessedText}
      </ReactMarkdown>
    </div>
  );
};