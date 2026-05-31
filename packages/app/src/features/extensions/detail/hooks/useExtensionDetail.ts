// src/features/extensions/detail/hooks/useExtensionDetail.ts
import { useEffect, useState } from 'react';
import type { ExtensionDetail } from '../../types';
import { fetchExtensionDetail } from '../../api/extensionApi';

interface DetailState {
  data:      ExtensionDetail | null;
  isLoading: boolean;
  error:     string | null;
}

export function useExtensionDetail(extensionId: string): DetailState {
  const [state, setState] = useState<DetailState>({
    data: null, isLoading: true, error: null,
  });

  useEffect(() => {
    if (!extensionId) return;
    let alive = true;

    setState({ data: null, isLoading: true, error: null });

    fetchExtensionDetail(extensionId)
      .then(data => {
        if (alive) setState({ data, isLoading: false, error: null });
      })
      .catch(err => {
        if (alive) setState({ data: null, isLoading: false, error: err.message });
      });

    return () => { alive = false; };
  }, [extensionId]);

  return state;
}