// src/features/extensions/detail/ExtensionDetailPage.tsx
import React, { useState } from 'react';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { useExtensionDetail } from './hooks/useExtensionDetail';

import { HeroSection }        from './sections/HeroSection';
import { DetailsTab }         from './sections/DetailsTab';
import { ContributionsTab }   from './sections/ContributionsTab';
import { ReviewTab }          from './sections/ReviewTab'

import type { DetailTab }     from '../types';
import './ExtensionDetailPage.css';

interface ExtensionDetailPageProps {
  extensionId: string;
}

// Added 'reviews' to the tabs
const TABS: { id: DetailTab | 'reviews'; label: string }[] = [
  { id: 'details',       label: 'Details' },
  { id: 'contributions', label: 'Contributions' },
  { id: 'changelog',     label: 'Changelog' },
  { id: 'reviews',       label: 'Ratings & Reviews' },
];

export const ExtensionDetailPage: React.FC<ExtensionDetailPageProps> = ({ extensionId }) => {
  const { data, isLoading, error } = useExtensionDetail(extensionId);
  const [activeTab, setActiveTab] = useState<DetailTab | 'reviews'>('details');

  if (isLoading) {
    return (
      <div className="ms-ext-detail-loading">
        <Icon name="refresh" size={24} className="ms-ext-spin" />
        <span>Loading extension details…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ms-ext-detail-error">
        <Icon name="warning" size={24} color="#ff4d4d" />
        <span>{error ?? 'Extension not found.'}</span>
      </div>
    );
  }

  return (
    <div className="ms-ext-detail-container">

      {/* ── 1. Hero Section ── */}
      <HeroSection manifest={data.manifest} />

      {/* ── 2. Tab Bar ── */}
      <div className="ms-ext-detail-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`ms-ext-detail-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'contributions' && (
              <span className="ms-ext-detail-tab-badge">
                {(data.contributions.languages?.length ?? 0) + 
                 (data.contributions.commands?.length ?? 0) + 
                 Object.keys(data.contributions.configuration ?? {}).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── 3. Tab Content Area ── */}
      <div className="ms-ext-detail-content">
        {activeTab === 'details'       && <DetailsTab       readme={data.readme} />}
        {activeTab === 'contributions' && <ContributionsTab contributions={data.contributions} />}
        {activeTab === 'changelog'     && <DetailsTab       readme={data.changelog} />}
        {activeTab === 'reviews'       && <ReviewTab        extensionId={extensionId} avgRating={data.manifest.rating} />}
      </div>

    </div>
  );
};