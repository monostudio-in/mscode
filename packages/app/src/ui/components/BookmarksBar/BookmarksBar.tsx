// src/ui/components/BookmarksBar/BookmarksBar.tsx
import React from 'react';
import { useRecentStore } from '@/store/recentStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { Icon } from '../Icon/IconRegistry';
import './BookmarksBar.css';

export const BookmarksBar: React.FC = () => {
  const { bookmarks, removeBookmark } = useRecentStore();
  const setWorkspace = useExplorerStore(s => s.setWorkspace);

  if (bookmarks.length === 0) return null;

  return (
    <div className="ms-bookmarks-bar">
      {bookmarks.map((bmark, idx) => (
        <div 
          key={idx} 
          className="ms-bookmark-tab"
          onClick={() => setWorkspace(bmark.name, bmark.path)}
          title={bmark.path}
        >
          <Icon name="folder" size={14} color="#dcb67a" />
          <span>{bmark.name}</span>
          
          <div 
            className="ms-bookmark-close"
            onClick={(e) => {
              e.stopPropagation();
              removeBookmark(bmark.path);
            }}
          >
            <Icon name="close" size={14} />
          </div>
        </div>
      ))}
    </div>
  );
};