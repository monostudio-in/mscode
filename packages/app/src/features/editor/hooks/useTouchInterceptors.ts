// useTouchInterceptors.ts 
import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

export function useTouchInterceptors(isPointerBlockRef: React.MutableRefObject<boolean>) {
  useEffect(() => {
    useLanguageStore.getState().refreshLanguages();
    
    let isDraggingColor = false;

    const handleTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isColorPicker = target.closest('.colorpicker-widget');
      
      if (e.type === 'touchstart' && isColorPicker) {
        isDraggingColor = true;
        e.stopPropagation(); 
      }

      if (isDraggingColor) {
        if (e.cancelable) e.preventDefault(); 

        const touch = e.changedTouches[0];
        const type = e.type === 'touchstart' ? 'mousedown' : 
                     e.type === 'touchmove' ? 'mousemove' : 'mouseup';

        const dispatchTarget = document.elementFromPoint(touch.clientX, touch.clientY) || target;
        
        dispatchTarget.dispatchEvent(new MouseEvent(type, {
          bubbles: true, cancelable: true, clientX: touch.clientX, clientY: touch.clientY
        }));

        if (e.type === 'touchend' || e.type === 'touchcancel') {
          isDraggingColor = false;
        }
      }

      if (e.type === 'touchend') {
        const isAnyWidget = target.closest('.lightBulbWidget, .monaco-menu-container, .monaco-hover, .suggest-widget, .colorpicker-widget, .find-widget');
        if (isAnyWidget) {
          isPointerBlockRef.current = true;
          setTimeout(() => { isPointerBlockRef.current = false; }, 500);
        }
      }
    };

    document.addEventListener('touchstart', handleTouch, { passive: false });
    document.addEventListener('touchmove', handleTouch, { passive: false });
    document.addEventListener('touchend', handleTouch, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('touchmove', handleTouch);
      document.removeEventListener('touchend', handleTouch);
    };
  }, [isPointerBlockRef]);
}