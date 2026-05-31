// src/features/extensions/detail/sections/DetailsTab.tsx
import React from 'react';
import { RichText } from '@/ui/components/RichText/RichText'; 

export const DetailsTab: React.FC<{ readme: string }> = ({ readme }) => {
  return (
    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
      <RichText text={readme} />
    </div>
  );
};