// src/features/editor/hooks/useKeyboardHandler.ts
//
// Responsibility: Detect keyboard hide (native + web) and blur the editor.
// Fires on:
//   - Native Android/iOS: keyboardWillHide + hardware back button
//   - Web browser: visualViewport resize (keyboard retract)

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app';

function blurActiveEditor() {
  const el = document.activeElement as HTMLElement;
  if (el && (el.tagName === 'TEXTAREA' || el.classList.contains('native-edit-context'))) {
    el.blur();
  }
}

export function useKeyboardHandler() {
  // return;
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (Capacitor.isNativePlatform()) {
      // ── Native: Capacitor keyboard + hardware back ──────────────────────
      (async () => {
        const kbListener   = await Keyboard.addListener('keyboardWillHide', blurActiveEditor);
        const backListener = await CapacitorApp.addListener('backButton',    blurActiveEditor);
        cleanup = () => {
          kbListener.remove();
          backListener.remove();
        };
      })();
    } else {
      // ── Web: visual viewport shrink = keyboard appeared, grow = gone ────
      const vp = window.visualViewport;
      if (!vp) return;

      let prevHeight = vp.height;
      const onResize = () => {
        if (vp.height - prevHeight > 100) blurActiveEditor();
        prevHeight = vp.height;
      };

      vp.addEventListener('resize', onResize);
      cleanup = () => vp.removeEventListener('resize', onResize);
    }

    return () => cleanup?.();
  }, []);
}