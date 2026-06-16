// src/core/extensionAPI/registry/previewerRegistry.ts
import React from 'react';

export interface CustomPreviewerProps {
  tabId: string;
  filePath: string;
}

export interface PreviewerContribution {
  id: string;                 // e.g., "mscode.imagePreview"
  name: string;               // e.g., "Image Preview"
  extensions: string[];       // e.g., [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]
  component: React.FC<CustomPreviewerProps>;
  priority: number;           // Higher priority overrides lower ones
}

class PreviewerRegistry {
  private previewers: PreviewerContribution[] = [];

  /**
   * Register a new custom previewer.
   * Third-party extensions will use this to overlap existing ones via higher priority.
   */
  public registerPreviewer(contribution: PreviewerContribution) {
    this.previewers.push(contribution);
    // Sort by priority descending (highest priority first)
    this.previewers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Find the most suitable previewer for a given file extension.
   */
  public getPreviewerForExtension(fileName: string): PreviewerContribution | null {
    const extMatch = fileName.match(/\.[0-9a-z]+$/i);
    if (!extMatch) return null;
    
    const ext = extMatch[0].toLowerCase();
    return this.previewers.find(previewer => previewer.extensions.includes(ext)) || null;
  }
}

export const customPreviewerRegistry = new PreviewerRegistry();