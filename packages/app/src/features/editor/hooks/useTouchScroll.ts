// src/features/editor/hooks/useTouchScroll.ts

import { useRef, useCallback } from 'react';
import type { MutableRefObject } from 'react';

interface UseTouchScrollOptions {
  editorRef:         MutableRefObject<any>;
  isDraggingRef:     MutableRefObject<boolean>;
  isScrollingRef:    MutableRefObject<boolean>;
  isPointerBlockRef: MutableRefObject<boolean>;
  globalScrollRef:   MutableRefObject<boolean>;
  userScrollingRef:  MutableRefObject<boolean>;
  updateTeardrops:   () => void;
  setTeardropsOn:    (v: boolean) => void;
}

const SCROLL_THRESHOLD = 8;
const AXIS_LOCK_RATIO = 2.5;
const VELOCITY_SAMPLES = 5;
const VELOCITY_MAX_AGE_MS = 80;
const MAX_VELOCITY = 4.5;
const MAX_ADDITIVE_VELOCITY = 40.0; 
const INERTIA_START_THRESHOLD = 0.12;
const INERTIA_STOP_THRESHOLD = 0.02;
const MAX_FRAME_DT = 32;

interface VelocitySample { dy: number; dx: number; time: number; }

class VelocityRingBuffer {
  private buf: VelocitySample[] = [];
  private cap: number;
  constructor(capacity = VELOCITY_SAMPLES) { this.cap = capacity; }
  push(sample: VelocitySample) {
    this.buf.push(sample);
    if (this.buf.length > this.cap) this.buf.shift();
  }
  reset() { this.buf = []; }
  compute(now: number): { vy: number; vx: number } {
    const recent = this.buf.filter(s => now - s.time < VELOCITY_MAX_AGE_MS);
    if (recent.length === 0) return { vy: 0, vx: 0 };
    const oldest = recent[0].time;
    const span   = now - oldest;
    if (span <= 0) return { vy: 0, vx: 0 };
    let sumWY = 0, sumWX = 0, sumW = 0;
    recent.forEach(s => {
      const age    = now - s.time;
      const weight = 1 - age / (VELOCITY_MAX_AGE_MS + 1); 
      sumWY += s.dy * weight;
      sumWX += s.dx * weight;
      sumW  += weight;
    });
    const vy = clamp(sumWY / sumW / (span / recent.length), -MAX_VELOCITY, MAX_VELOCITY);
    const vx = clamp(sumWX / sumW / (span / recent.length), -MAX_VELOCITY, MAX_VELOCITY);
    return { vy, vx };
  }
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

function adaptiveFriction(speed: number, dt: number): number {
  let base: number;
  if (speed < 1.0)       base = 0.995;   
  else if (speed <= 4.5) base = 0.993;   
  else if (speed < 15.0) base = 0.990;   
  else                   base = 0.985;   
  return Math.pow(base, dt);
}

export function useTouchScroll({
  editorRef, isDraggingRef, isScrollingRef, isPointerBlockRef,
  globalScrollRef, userScrollingRef, updateTeardrops,
}: UseTouchScrollOptions) {
  const pointerBlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userScrollTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchScrollRafRef = useRef<number | null>(null);

  const attachTouchListeners = useCallback((domNode: HTMLElement) => {
    
    
    const editor = editorRef.current;
    if (!editor || !domNode) return;

    type ActiveTarget = 'editor' | HTMLElement;
    let activeTarget: ActiveTarget = 'editor';
    let touchStartY  = 0, touchStartX  = 0;
    let startScrollTop = 0, startScrollLeft = 0;
    let touchIsScrolling = false;
    let widgetIsDragging = false;
    let lockedAxis: 'y' | 'x' | null = null;
    let exactScrollTop  = 0;
    let exactScrollLeft = 0;
    let velocityY = 0, velocityX = 0;
    let residualVy = 0, residualVx = 0;
    let touchStartTime = 0;
    const ringBuf = new VelocityRingBuffer(VELOCITY_SAMPLES);
    let lastMoveY = 0, lastMoveX = 0, lastMoveTime = 0;
    let inertiaRafId: number | null = null;
    
    let lastTapTime = 0; // Track double taps to prevent overriding selections

    const restorePointerEvents = () => {
      const viewLines = domNode.querySelector('.view-lines') as HTMLElement | null;
      if (viewLines && viewLines.style.pointerEvents === 'none') viewLines.style.pointerEvents = '';
    };

    const isWidgetTarget = (target: HTMLElement | null) =>
      !!target?.closest('.suggest-widget, .monaco-list, .parameter-hints-widget, .find-widget, .monaco-menu-container');

    const stopInertia = () => {
      if (inertiaRafId !== null) { cancelAnimationFrame(inertiaRafId); inertiaRafId = null; }
      restorePointerEvents();
      if (userScrollingRef.current || globalScrollRef.current) {
        userScrollingRef.current = false; globalScrollRef.current = false; touchIsScrolling = false;
        if (userScrollTimer.current) clearTimeout(userScrollTimer.current);
        updateTeardrops();
      }
    };

    const cancelScrollRaf = () => {
      if (touchScrollRafRef.current !== null) { cancelAnimationFrame(touchScrollRafRef.current); touchScrollRafRef.current = null; }
    };

    const finishScroll = () => {
      restorePointerEvents();
      if (userScrollTimer.current) clearTimeout(userScrollTimer.current);
      userScrollTimer.current = setTimeout(() => {
        userScrollingRef.current = false; globalScrollRef.current = false; updateTeardrops();
      }, 200);
    };

    const dispatchWheelToWidget = (el: HTMLElement, dy: number, dx: number) => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -dy, deltaX: -dx, deltaMode: 0, bubbles: true, cancelable: true }));
    };
    
    // Selection Out-of-Viewport Blurring
    const scrollDisposable = editor.onDidScrollChange(() => {
      
    // Guard against automated scroll adjustments triggered by Monaco during snippet placement.
    // Restrict blur execution paths exclusively to intentional user-driven touch or trackpad gestures.
      if (!userScrollingRef.current && !globalScrollRef.current) return;


      const sel = editor.getSelection();
      if (!sel || sel.isEmpty()) return; 

      const layout = editor.getLayoutInfo();
      const scrollTop = editor.getScrollTop();
      
      const activeTop = editor.getTopForLineNumber(sel.positionLineNumber);
      const viewportBottom = scrollTop + layout.height;

      const isGoingAbove = activeTop < scrollTop + 80; 
      const isGoingBelow = activeTop > viewportBottom - 80;

      if (isGoingAbove || isGoingBelow) {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && typeof activeEl.blur === 'function') activeEl.blur(); 
        
        if ('virtualKeyboard' in navigator) {
          (navigator as any).virtualKeyboard.hide();
        }
        try { document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); } catch (e) {}
      }
    });
    
    
    const onTouchStart = (e: TouchEvent) => {
      if (isDraggingRef.current || e.touches.length !== 1) return;
      const target = e.target as HTMLElement;

      if (target?.closest('.colorpicker-widget, .lightBulbWidget , .find-widget')) return;

      if (isWidgetTarget(target)) {
        const listWrapper = target.closest('.monaco-scrollable-element') as HTMLElement | null;
        activeTarget = listWrapper ?? 'editor';
        widgetIsDragging = false;
      } else { activeTarget = 'editor'; }

      if (inertiaRafId !== null) { residualVy = velocityY; residualVx = velocityX; } 
      else { residualVy = 0; residualVx = 0; }

      touchStartTime = Date.now();
      stopInertia();

      const t = e.touches[0];
      touchStartY = t.clientY; touchStartX = t.clientX;
      lastMoveY = t.clientY; lastMoveX = t.clientX;
      lastMoveTime = touchStartTime;

      touchIsScrolling = false; lockedAxis = null;
      ringBuf.reset();

      if (activeTarget === 'editor') {
        startScrollTop = editor.getScrollTop();
        startScrollLeft = editor.getScrollLeft();
      }

      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      longPressTimer.current = setTimeout(() => {
        if (!touchIsScrolling && activeTarget === 'editor') {
          editor.trigger('touch', 'editor.action.showContextMenu', null);
        }
      }, 600);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current || e.touches.length !== 1) return;
      const target = e.target as HTMLElement;

      if (target?.closest('.colorpicker-widget, .lightBulbWidget , .find-widget')) return;

      const t = e.touches[0]; const now = Date.now();
      const frameDy = lastMoveY - t.clientY; const frameDx = lastMoveX - t.clientX; const dt = now - lastMoveTime;

      if (dt > 0) ringBuf.push({ dy: frameDy, dx: frameDx, time: now });
      lastMoveY = t.clientY; lastMoveX = t.clientX; lastMoveTime = now;

      const totalDy = touchStartY - t.clientY; const totalDx = touchStartX - t.clientX;
      const absDy = Math.abs(totalDy); const absDx = Math.abs(totalDx);

      if (!touchIsScrolling && absDy < SCROLL_THRESHOLD && absDx < SCROLL_THRESHOLD) return;
      if (lockedAxis === null) lockedAxis = absDy >= absDx ? 'y' : 'x';

      let scrollDy = totalDy; let scrollDx = totalDx;
      if (lockedAxis === 'y' && absDx * AXIS_LOCK_RATIO < absDy) scrollDx = 0;
      else if (lockedAxis === 'x' && absDy * AXIS_LOCK_RATIO < absDx) scrollDy = 0;

      if (!touchIsScrolling) {
        touchIsScrolling = true; globalScrollRef.current = true; userScrollingRef.current = true;
        if (activeTarget !== 'editor') widgetIsDragging = true;
        if (longPressTimer.current) clearTimeout(longPressTimer.current);

        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl?.tagName === 'TEXTAREA') {
          const sel = editor.getSelection();
          if (sel && !sel.isEmpty() && 'virtualKeyboard' in navigator) (navigator as any).virtualKeyboard.hide();
          else activeEl.blur();
        }

        if (activeTarget === 'editor') {
          const viewLines = domNode.querySelector('.view-lines') as HTMLElement | null;
          if (viewLines) viewLines.style.pointerEvents = 'none';
        }
      }

      cancelScrollRaf();
      touchScrollRafRef.current = requestAnimationFrame(() => {
        touchScrollRafRef.current = null;
        if (activeTarget === 'editor') {
          editor.setScrollTop(startScrollTop + scrollDy);
          editor.setScrollLeft(startScrollLeft + scrollDx);
        } else {
          dispatchWheelToWidget(activeTarget, frameDy, frameDx);
        }
      });
      e.preventDefault(); e.stopPropagation();
    };

    const onTouchEnd = (e: TouchEvent) => {
      const targetEl = e.target as HTMLElement;

      if (targetEl?.closest('.colorpicker-widget, .lightBulbWidget , .find-widget')) return;

      if (activeTarget !== 'editor') {
        if (widgetIsDragging) { e.stopPropagation(); setTimeout(() => { widgetIsDragging = false; }, 100); } 
        else widgetIsDragging = false;
      }
      if (longPressTimer.current) clearTimeout(longPressTimer.current);

      if (
        activeTarget === 'editor' && targetEl && typeof targetEl.className === 'string' &&
        (targetEl.className.includes('codicon-folding') || targetEl.className.includes('colorpicker-color-decoration'))
      ) {
        if (e.cancelable) e.preventDefault();
        const touch  = e.changedTouches[0];
        const hitPos = editor.getTargetAtClientPoint(touch.clientX, touch.clientY);
        if (hitPos?.position) {
          editor.setPosition(hitPos.position);
          if (targetEl.className.includes('codicon-folding')) {
            editor.trigger('touch', 'editor.toggleFold', {});
          } else {
            editor.trigger('touch', 'editor.action.showHover', null);
          }
        }
        return;
      }

      // Accurate Touch Cursor Placement (The Ultimate Solution)
      if (!touchIsScrolling) {
        const now = Date.now();
        const isDoubleTap = now - lastTapTime < 300; // Detect double-tap sequence
        lastTapTime = now;
      
        if (activeTarget === 'editor' && e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          const hitPos = editor.getTargetAtClientPoint(touch.clientX, touch.clientY);
          
          // Target coordinate validation mapping constants:
          // 6 = MouseTargetType.CONTENT_TEXT (Directly over programmatic character text tokens)
          // 7 = MouseTargetType.CONTENT_EMPTY (Within line breaks or whitespace dead zones)
          if (!isDoubleTap && hitPos?.position && (hitPos.type === 6 || hitPos.type === 7)) {
            /**
             * Crucial Interception Override Layer:
             * Allows the native OS browser click pipeline to finalize execution cycles first.
             * After a deterministic 40ms frame window delay, we intercept the event loop, 
             * override any layout displacement, and force-inject the absolute calculated pixel position.
             */
            setTimeout(() => {
              const sel = editor.getSelection();
              
              // Safeguard: If a native double-tap sequence has successfully captured an active 
              // word selection block, skip adjustments entirely to preserve the selection range.
              if (sel && sel.isEmpty()) { 
                editor.setPosition(hitPos.position);
                if (!editor.hasTextFocus()) editor.focus();
              }
            }, 40);
          }
        }
        return; // Halted: Event context resolved as a standard discrete tap, terminating alternate scroll-tracking trees.
      }

      if (e.cancelable) e.preventDefault();
      e.stopPropagation(); cancelScrollRaf();
      
      const now = Date.now(); const sampled = ringBuf.compute(now);
      let finalVy = sampled.vy; let finalVx = sampled.vx;

      if (Math.abs(finalVy) > 0.5) { if (finalVy * residualVy > 0) finalVy += (residualVy * 0.95); } else finalVy = 0;
      if (Math.abs(finalVx) > 0.5) { if (finalVx * residualVx > 0) finalVx += (residualVx * 0.95); } else finalVx = 0;

      velocityY = lockedAxis === 'x' ? 0 : clamp(finalVy, -MAX_ADDITIVE_VELOCITY, MAX_ADDITIVE_VELOCITY);
      velocityX = lockedAxis === 'y' ? 0 : clamp(finalVx, -MAX_ADDITIVE_VELOCITY, MAX_ADDITIVE_VELOCITY);
      residualVy = 0; residualVx = 0;

      isPointerBlockRef.current = true;
      if (pointerBlockTimer.current) clearTimeout(pointerBlockTimer.current);
      pointerBlockTimer.current = setTimeout(() => { isPointerBlockRef.current = false; }, 500);

      const hasVelocity = Math.abs(velocityY) > INERTIA_START_THRESHOLD || Math.abs(velocityX) > INERTIA_START_THRESHOLD;
      if (!hasVelocity) { setTimeout(restorePointerEvents, 80); finishScroll(); return; }

      exactScrollTop  = activeTarget === 'editor' ? editor.getScrollTop()  : 0;
      exactScrollLeft = activeTarget === 'editor' ? editor.getScrollLeft() : 0;
      let lastFrameTime = performance.now();

      const inertiaLoop = (nowPerf: DOMHighResTimeStamp) => {
        const rawDt  = nowPerf - lastFrameTime;
        const frameDt = rawDt > 0 && rawDt < MAX_FRAME_DT ? rawDt : 16;
        lastFrameTime = nowPerf;
        const speed = Math.sqrt(velocityY * velocityY + velocityX * velocityX);
        const friction = adaptiveFriction(speed, frameDt);
        const stepY = velocityY * frameDt; const stepX = velocityX * frameDt;

        if (activeTarget === 'editor') {
          exactScrollTop  += stepY; exactScrollLeft += stepX;
          const maxTop  = editor.getScrollHeight() - editor.getLayoutInfo().height;
          const maxLeft = editor.getScrollWidth()  - editor.getLayoutInfo().width;
          if (exactScrollTop  < 0)       { exactScrollTop  = 0;       velocityY = 0; }
          if (exactScrollLeft < 0)       { exactScrollLeft = 0;       velocityX = 0; }
          if (exactScrollTop  > maxTop)  { exactScrollTop  = maxTop;  velocityY = 0; }
          if (exactScrollLeft > maxLeft) { exactScrollLeft = maxLeft; velocityX = 0; }
          editor.setScrollTop(exactScrollTop); editor.setScrollLeft(exactScrollLeft);
        } else { dispatchWheelToWidget(activeTarget, stepY, stepX); }

        velocityY *= friction; velocityX *= friction;
        const stillMoving = Math.abs(velocityY) > INERTIA_STOP_THRESHOLD || Math.abs(velocityX) > INERTIA_STOP_THRESHOLD;
        if (stillMoving) { inertiaRafId = requestAnimationFrame(inertiaLoop); } 
        else { inertiaRafId = null; restorePointerEvents(); finishScroll(); }
      };

      inertiaRafId = requestAnimationFrame(inertiaLoop);
    };

    const preventWidgetClick = (e: Event) => {
      if (widgetIsDragging && isWidgetTarget(e.target as HTMLElement)) { e.stopPropagation(); e.preventDefault(); }
    };
    
    domNode.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    domNode.addEventListener('touchmove',  onTouchMove, { passive: false, capture: true });
    domNode.addEventListener('touchend',   onTouchEnd, { passive: false, capture: true });
    domNode.addEventListener('pointerup',  preventWidgetClick, { capture: true });
    domNode.addEventListener('click',      preventWidgetClick, { capture: true });

    return {
      dispose: () => {
        scrollDisposable.dispose();
        
        domNode.removeEventListener('touchstart', onTouchStart, { capture: true } as EventListenerOptions);
        domNode.removeEventListener('touchmove',  onTouchMove, { capture: true } as EventListenerOptions);
        domNode.removeEventListener('touchend',   onTouchEnd, { capture: true } as EventListenerOptions);
        domNode.removeEventListener('pointerup',  preventWidgetClick, { capture: true } as EventListenerOptions);
        domNode.removeEventListener('click',      preventWidgetClick, { capture: true } as EventListenerOptions);
        [pointerBlockTimer, longPressTimer, userScrollTimer].forEach(r => { if (r.current) clearTimeout(r.current); });
        cancelScrollRaf(); stopInertia();
      },
    };
  }, [editorRef, isDraggingRef, isScrollingRef, isPointerBlockRef, globalScrollRef, userScrollingRef, updateTeardrops]);

  return { attachTouchListeners };
}