/**
 * Smooth Scroll Utility using Lenis when available,
 * with fallback to native browser smooth scrolling.
 */
export function smoothScrollTo(target: string | number | HTMLElement, duration = 1.6) {
  if (typeof window === 'undefined') return;

  const lenis = (window as any).__lenis;
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(target, { 
      duration,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
