// src/features/extensions/components/ExtensionCard.tsx
import React from 'react';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { Button } from '@/ui/components/Button/Button';
import type { Extension, ExtensionRecord } from '../types';
import { formatDownloads } from '../store/selectors';
import { ExtensionIcon } from './ExtensionIcon';

interface ExtensionCardProps {
  ext:         Extension;
  record:      ExtensionRecord | undefined;
  onInstall:   (id: string) => void;
  onUninstall: (id: string) => void;
  onEnable:    (id: string) => void;
  onDisable:   (id: string) => void;
  onOpenDetail:(id: string) => void;
  onUpdate:    (id: string) => void; 
  hasUpdate:   boolean;             
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({
  ext, record, onInstall, onUninstall, onEnable, onDisable, onOpenDetail, onUpdate, hasUpdate
}) => {
  const state = record?.state ?? 'not-installed';
  const isDisabled = state === 'installed-disabled';

  return (
    <div className={`ms-ext-card ${isDisabled ? 'ms-ext-card--disabled' : ''}`}
      onClick={() => onOpenDetail(ext.id)}
    >
      {/* Smart Icon */}
      <ExtensionIcon 
        icon={ext.icon} 
        storeDir={ext.storeDir} 
        name={ext.name} 
        iconColor={ext.iconColor} 
        iconLetter={ext.iconLetter} 
        size={42} 
      />

      {/* ── Body ── */}
      <div className="ms-ext-card__body">
        <div className="ms-ext-card__name-row">
          <span className="ms-ext-card__name">{ext.name}</span>
          {ext.isVerified && (
            <span className="ms-ext-card__badge ms-ext-card__badge--verified" title="Verified Publisher">
              <Icon name="check" size={10} />
            </span>
          )}
          {ext.isBuiltIn && <span className="ms-ext-card__badge ms-ext-card__badge--builtin">built-in</span>}
          {isDisabled && <span className="ms-ext-card__badge ms-ext-card__badge--disabled">disabled</span>}
        </div>

        <div className="ms-ext-card__desc">{ext.description}</div>

        <div className="ms-ext-card__meta">
          <span className="ms-ext-card__publisher">{ext.publisher}</span>
          <span className="ms-ext-card__dot">·</span>
          <Icon name="cloud-download" size={11} style={{ opacity: 0.6 }} />
          <span className="ms-ext-card__stat">{formatDownloads(ext.downloads)}</span>
          <span className="ms-ext-card__dot">·</span>
          <span className="ms-ext-card__rating" title={`${ext.rating} / 5`}>
            {'★'.repeat(Math.round(ext.rating))}
          </span>
          <span className="ms-ext-card__stat">{ext.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div
        className="ms-ext-card__actions"
        onClick={e => e.stopPropagation()}
      >
        {/*ে Update button */}
        {hasUpdate ? (
          <Button
            variant="type1"
            narrow
            onClick={() => onUpdate(ext.id)}
            className="ms-ext-btn-install"
          >
            Update
          </Button>
        ) : (
          <>
            {/* NOT INSTALLED → Install button */}
            {state === 'not-installed' && (
              <Button
                variant="type1"
                narrow
                onClick={() => onInstall(ext.id)}
                className="ms-ext-btn-install"
              >
                Install
              </Button>
            )}

            {/* INSTALLED ENABLED → settings + disable + uninstall */}
            {state === 'installed-enabled' && (
              <div className="ms-ext-card__installed-actions">
                <Icon
                  name="settings"
                  size={14}
                  className="ms-ext-action-icon"
                  title="Extension Settings"
                  onClick={() => console.log(`Settings: ${ext.id}`)}
                />
                {!ext.isBuiltIn && (
                  <>
                    <Icon
                      name="circle-slash"
                      size={14}
                      className="ms-ext-action-icon"
                      title="Disable"
                      onClick={() => onDisable(ext.id)}
                    />
                    <Icon
                      name="trash"
                      size={14}
                      className="ms-ext-action-icon ms-ext-action-icon--danger"
                      title="Uninstall"
                      onClick={() => onUninstall(ext.id)}
                    />
                  </>
                )}
              </div>
            )}

            {/* INSTALLED DISABLED → Enable + Uninstall */}
            {state === 'installed-disabled' && (
              <div className="ms-ext-card__installed-actions">
                <Button
                  variant="type2"
                  narrow
                  onClick={() => onEnable(ext.id)}
                >
                  Enable
                </Button>
                <Icon
                  name="trash"
                  size={14}
                  className="ms-ext-action-icon ms-ext-action-icon--danger"
                  title="Uninstall"
                  onClick={() => onUninstall(ext.id)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};