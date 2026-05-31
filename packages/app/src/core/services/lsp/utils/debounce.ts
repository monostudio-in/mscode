// src/core/services/lsp/utils/debounce.ts

/**
 * Creates a debounced function that delays invoking `fn` until after `delay` milliseconds 
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @note Instatuate individual instances of this wrapper per editor model or source track, 
 * otherwise overlapping global calls will prematurely cancel active cross-model typing delays.
 * 
 * @param fn The target logic callback function to safely throttle behind event cycles.
 * @param delay The operational window cooldown delay specified in milliseconds.
 * @returns An isolated execution loop handler encapsulating internal timeout hooks.
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return ((...args: any[]) => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  }) as T;
}
