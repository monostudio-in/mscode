// src/ui/components/Toast/ToastItem.tsx
import React, { useEffect, useRef } from 'react';
import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { Icon }       from '@/ui/components/Icon/IconRegistry';
import { useToastStore, DEFAULT_ICONS } from '@/store/toastStore';
import type { ToastRecord } from '@/store/toastStore';

// ── Motion variants ────────────────────────────────────────────────────────────

type VariantConfig = { 
  initial: TargetAndTransition; 
  animate: TargetAndTransition; 
  exit: TargetAndTransition 
};

const VARIANTS: Record<string, VariantConfig> = {
  'bottom-center': {
    initial: { opacity: 0, y: 16, scale: 0.95 },
    animate: { opacity: 1, y: 0,  scale: 1 },
    exit:    { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.18 } },
  },
  'bottom-left': {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: { opacity: 1, x: 0,   scale: 1 },
    exit:    { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.18 } },
  },
  'bottom-right': {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    animate: { opacity: 1, x: 0,  scale: 1 },
    exit:    { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.18 } },
  },
  'side-right': {
    initial: { opacity: 0, x: '110%' },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: '110%', transition: { duration: 0.22, ease: 'easeIn' } },
  },
  'side-left': {
    initial: { opacity: 0, x: '-110%' },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: '-110%', transition: { duration: 0.22, ease: 'easeIn' } },
  },
};

const ENTER_TRANSITION: Transition = { type: 'spring', damping: 28, stiffness: 380, mass: 0.6 };


// ── Component ──────────────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: ToastRecord;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const remove       = useToastStore(s => s.remove);
  const isSide       = toast.position === 'side-right' || toast.position === 'side-left';
  const isPermanent  = toast.duration === 0;
  const variantKey   = toast.position;
  const variant      = VARIANTS[variantKey] ?? VARIANTS['bottom-center'];
  const iconName     = toast.icon ?? DEFAULT_ICONS[toast.type];

  // ── Auto-dismiss timeout ──────────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPermanent) return;
    timerRef.current = setTimeout(() => remove(toast.id), toast.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.duration, isPermanent, remove]);

  // ── Pause on hover ────────────────────────────────────────────────────────
  // (Only for bottom toasts — side toasts show a visible timer, pausing is confusing)
  const pauseTimer = () => {
    if (isSide || isPermanent) return;
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const resumeTimer = () => {
    if (isSide || isPermanent) return;
    // Resume with remaining time estimation is complex; just restart full duration
    timerRef.current = setTimeout(() => remove(toast.id), toast.duration);
  };

  return (
    <motion.div
      layout
      key={toast.id}
      className={[
        'ms-toast',
        `ms-toast--${toast.type}`,
        `ms-toast--${toast.position}`,
        isSide ? 'ms-toast--side' : 'ms-toast--bottom',
        toast.className,
      ].filter(Boolean).join(' ')}
      style={toast.style}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={ENTER_TRANSITION}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      {/* ── Progress bar (side toasts only, at TOP border) ── */}
      {isSide && !isPermanent && (
        <div
          className="ms-toast__progress"
          style={{ animationDuration: `${toast.duration}ms` }}
          onAnimationEnd={() => remove(toast.id)}
        />
      )}

      {/* ── Body ── */}
      <div className="ms-toast__body">
        {/* Left accent / icon */}
        <span className="ms-toast__icon">
          <Icon name={iconName as any} size={16} />
        </span>

        {/* Text */}
        <div className="ms-toast__text">
          <span className="ms-toast__message">{toast.message}</span>
          {toast.description && (
            <span className="ms-toast__description">{toast.description}</span>
          )}
        </div>

        {/* Inline action button */}
        {toast.action && (
          <button
            className="ms-toast__action"
            onClick={() => { toast.action!.onClick(); remove(toast.id); }}
          >
            {toast.action.label}
          </button>
        )}

        {/* Dismiss × */}
        <button
          className="ms-toast__close"
          aria-label="Dismiss"
          onClick={() => remove(toast.id)}
        >
          <Icon name="close" size={13} />
        </button>
      </div>
    </motion.div>
  );
};