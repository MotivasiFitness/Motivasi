/**
 * React Hook for Safari-Specific Optimizations
 * Provides easy integration of Safari fixes in React components
 */

import { useEffect, useRef, useState } from 'react';
import React from 'react';
import {
  isSafari,
  isIOSSafari,
  isMacOSSafari,
  getSafariVersion,
  supportsSafariFeature,
  applyStickyPositioningFix,
  preventInputZoom,
  enableHardwareAcceleration,
  enableMomentumScrolling,
  applyBackdropFilterFix,
  applyPerspectiveFix,
  initializeSafariOptimizations,
} from '@/lib/safari-optimization';

/**
 * Hook to apply Safari-specific fixes to a DOM element
 */
export const useSafariElementFix = (
  ref: React.RefObject<HTMLElement>,
  options?: {
    sticky?: boolean;
    hardwareAcceleration?: boolean;
    momentumScrolling?: boolean;
    backdropFilter?: boolean;
    perspective?: boolean;
  }
) => {
  useEffect(() => {
    if (!ref.current || !isSafari()) return;

    const element = ref.current;

    if (options?.sticky) {
      applyStickyPositioningFix(element);
    }

    if (options?.hardwareAcceleration) {
      enableHardwareAcceleration(element);
    }

    if (options?.momentumScrolling) {
      enableMomentumScrolling(element);
    }

    if (options?.backdropFilter) {
      applyBackdropFilterFix(element);
    }

    if (options?.perspective) {
      applyPerspectiveFix(element);
    }
  }, [ref, options]);
};

/**
 * Hook to initialize all Safari optimizations on mount
 */
export const useSafariOptimization = () => {
  useEffect(() => {
    initializeSafariOptimizations();
  }, []);

  return {
    isSafari: isSafari(),
    isIOSSafari: isIOSSafari(),
    isMacOSSafari: isMacOSSafari(),
    safariVersion: getSafariVersion(),
  };
};

/**
 * Hook to check Safari feature support
 */
export const useSafariFeatureSupport = (feature: 'backdrop-filter' | 'aspect-ratio' | 'css-grid' | 'webp') => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(supportsSafariFeature(feature));
  }, [feature]);

  return isSupported;
};

/**
 * Hook to prevent input zoom on iOS Safari
 */
export const usePreventInputZoom = () => {
  useEffect(() => {
    if (!isIOSSafari()) return;
    preventInputZoom();
  }, []);
};

/**
 * Hook to apply momentum scrolling to a scrollable container
 */
export const useMomentumScrolling = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current || !isIOSSafari()) return;
    enableMomentumScrolling(ref.current);
  }, [ref]);
};

/**
 * Hook to apply hardware acceleration to animated elements
 */
export const useHardwareAcceleration = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current || !isSafari()) return;
    enableHardwareAcceleration(ref.current);
  }, [ref]);
};

/**
 * Hook to get Safari browser information
 */
export const useSafariBrowserInfo = () => {
  const [browserInfo, setBrowserInfo] = useState({
    isSafari: false,
    isIOSSafari: false,
    isMacOSSafari: false,
    version: null as number | null,
  });

  useEffect(() => {
    setBrowserInfo({
      isSafari: isSafari(),
      isIOSSafari: isIOSSafari(),
      isMacOSSafari: isMacOSSafari(),
      version: getSafariVersion(),
    });
  }, []);

  return browserInfo;
};
