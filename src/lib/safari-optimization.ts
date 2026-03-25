/**
 * Safari-Specific Optimization Utilities
 * Handles browser detection, feature detection, and Safari-specific fixes
 */

/**
 * Detect if running on Safari browser
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent;
  const isSafariUA = /^((?!chrome|android).)*safari/i.test(ua);
  const isNotChromium = !/chrome|chromium|crios/i.test(ua);
  
  return isSafariUA && isNotChromium;
};

/**
 * Detect if running on iOS Safari
 */
export const isIOSSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua);
};

/**
 * Detect if running on macOS Safari
 */
export const isMacOSSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent;
  return /Macintosh/.test(ua) && isSafari();
};

/**
 * Get Safari version
 */
export const getSafariVersion = (): number | null => {
  if (typeof window === 'undefined') return null;
  
  const ua = navigator.userAgent;
  const match = ua.match(/Version\/(\d+)/);
  
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Check if Safari supports a specific feature
 */
export const supportsSafariFeature = (feature: 'backdrop-filter' | 'aspect-ratio' | 'css-grid' | 'webp'): boolean => {
  if (typeof window === 'undefined') return false;
  
  const element = document.createElement('div');
  const style = element.style;
  
  switch (feature) {
    case 'backdrop-filter':
      return 'backdropFilter' in style || 'webkitBackdropFilter' in style;
    case 'aspect-ratio':
      return 'aspectRatio' in style;
    case 'css-grid':
      return 'grid' in style;
    case 'webp':
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
    default:
      return false;
  }
};

/**
 * Fix for Safari's sticky positioning issues
 * Applies necessary styles and workarounds
 */
export const applyStickyPositioningFix = (element: HTMLElement): void => {
  if (!isSafari() || !element) return;
  
  // Ensure parent has overflow: visible
  const parent = element.parentElement;
  if (parent) {
    parent.style.overflow = 'visible';
  }
  
  // Apply sticky positioning with webkit prefix
  element.style.position = '-webkit-sticky' as any;
  element.style.position = 'sticky' as any;
};

/**
 * Fix for Safari's input zoom on focus
 * Prevents unwanted zoom when focusing on inputs
 */
export const preventInputZoom = (): void => {
  if (!isIOSSafari()) return;
  
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    element.style.fontSize = '16px';
  });
};

/**
 * Enable hardware acceleration for better performance
 */
export const enableHardwareAcceleration = (element: HTMLElement): void => {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform';
  element.style.backfaceVisibility = 'hidden';
};

/**
 * Fix for Safari's scrolling performance
 * Enables momentum scrolling on iOS
 */
export const enableMomentumScrolling = (element: HTMLElement): void => {
  if (!isIOSSafari()) return;
  
  element.style.webkitOverflowScrolling = 'touch' as any;
};

/**
 * Polyfill for aspect-ratio in older Safari versions
 */
export const polyfillAspectRatio = (): void => {
  if (supportsSafariFeature('aspect-ratio')) return;
  
  const elements = document.querySelectorAll('[style*="aspect-ratio"]');
  elements.forEach((element) => {
    const aspectRatio = (element as HTMLElement).style.aspectRatio;
    if (aspectRatio) {
      const [width, height] = aspectRatio.split('/').map(v => parseFloat(v.trim()));
      const ratio = (height / width) * 100;
      
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.width = '100%';
      wrapper.style.paddingBottom = `${ratio}%`;
      
      const content = document.createElement('div');
      content.style.position = 'absolute';
      content.style.top = '0';
      content.style.left = '0';
      content.style.width = '100%';
      content.style.height = '100%';
      
      element.parentNode?.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    }
  });
};

/**
 * Fix for Safari's backdrop-filter support
 */
export const applyBackdropFilterFix = (element: HTMLElement): void => {
  if (!supportsSafariFeature('backdrop-filter')) {
    // Fallback for older Safari versions
    element.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  } else {
    // Ensure webkit prefix is applied
    (element.style as any).webkitBackdropFilter = (element.style as any).backdropFilter;
  }
};

/**
 * Fix for Safari's transform-origin with perspective
 */
export const applyPerspectiveFix = (element: HTMLElement): void => {
  (element.style as any).webkitPerspective = (element.style as any).perspective;
  (element.style as any).webkitTransformStyle = (element.style as any).transformStyle;
};

/**
 * Initialize all Safari optimizations
 */
export const initializeSafariOptimizations = (): void => {
  if (typeof window === 'undefined') return;
  
  // Prevent input zoom on iOS Safari
  preventInputZoom();
  
  // Polyfill aspect-ratio if needed
  polyfillAspectRatio();
  
  // Apply fixes on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyAllFixes();
    });
  } else {
    applyAllFixes();
  }
};

/**
 * Apply all Safari fixes to the document
 */
const applyAllFixes = (): void => {
  // Fix sticky positioning
  document.querySelectorAll('.sticky').forEach((element) => {
    applyStickyPositioningFix(element as HTMLElement);
  });
  
  // Enable hardware acceleration for animated elements
  document.querySelectorAll('[class*="animate"]').forEach((element) => {
    enableHardwareAcceleration(element as HTMLElement);
  });
  
  // Enable momentum scrolling for scrollable containers
  document.querySelectorAll('[class*="overflow"]').forEach((element) => {
    enableMomentumScrolling(element as HTMLElement);
  });
  
  // Apply backdrop filter fixes
  document.querySelectorAll('[class*="backdrop"]').forEach((element) => {
    applyBackdropFilterFix(element as HTMLElement);
  });
};

/**
 * Get Safari-specific performance metrics
 */
export const getSafariPerformanceMetrics = (): {
  isSafari: boolean;
  isIOSSafari: boolean;
  version: number | null;
  supportsBackdropFilter: boolean;
  supportsAspectRatio: boolean;
} => {
  return {
    isSafari: isSafari(),
    isIOSSafari: isIOSSafari(),
    version: getSafariVersion(),
    supportsBackdropFilter: supportsSafariFeature('backdrop-filter'),
    supportsAspectRatio: supportsSafariFeature('aspect-ratio'),
  };
};

/**
 * Log Safari optimization status (for debugging)
 */
export const logSafariOptimizationStatus = (): void => {
  if (typeof window === 'undefined') return;
  
  const metrics = getSafariPerformanceMetrics();
  console.log('Safari Optimization Status:', {
    ...metrics,
    userAgent: navigator.userAgent,
  });
};
