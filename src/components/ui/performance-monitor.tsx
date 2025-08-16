'use client';

import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export const PerformanceMonitor = React.memo(function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR) {
      return;
    }

    const measurePerformance = () => {
      // Measure Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
          } else if (entry.entryType === 'first-input') {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          } else if (entry.entryType === 'layout-shift') {
            if (!entry.hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + entry.value }));
            }
          }
        }
      });

      // Register observers for different metrics
      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Browser doesn't support some metrics
        console.warn('Performance observation not fully supported:', e);
      }

      // Measure TTFB from navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({ ...prev, ttfb: navigation.responseStart - navigation.requestStart }));
      }

      return () => observer.disconnect();
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      const cleanup = measurePerformance();
      return cleanup;
    } else {
      const handleLoad = () => {
        const cleanup = measurePerformance();
        window.removeEventListener('load', handleLoad);
        return cleanup;
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Don't render anything in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Performance Metrics</div>
      {metrics.fcp && (
        <div className={`${metrics.fcp > 1800 ? 'text-red-400' : metrics.fcp > 1200 ? 'text-yellow-400' : 'text-green-400'}`}>
          FCP: {Math.round(metrics.fcp)}ms
        </div>
      )}
      {metrics.lcp && (
        <div className={`${metrics.lcp > 2500 ? 'text-red-400' : metrics.lcp > 1800 ? 'text-yellow-400' : 'text-green-400'}`}>
          LCP: {Math.round(metrics.lcp)}ms
        </div>
      )}
      {metrics.fid && (
        <div className={`${metrics.fid > 100 ? 'text-red-400' : metrics.fid > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
          FID: {Math.round(metrics.fid)}ms
        </div>
      )}
      {metrics.cls && (
        <div className={`${metrics.cls > 0.25 ? 'text-red-400' : metrics.cls > 0.1 ? 'text-yellow-400' : 'text-green-400'}`}>
          CLS: {metrics.cls.toFixed(3)}
        </div>
      )}
      {metrics.ttfb && (
        <div className={`${metrics.ttfb > 800 ? 'text-red-400' : metrics.ttfb > 400 ? 'text-yellow-400' : 'text-green-400'}`}>
          TTFB: {Math.round(metrics.ttfb)}ms
        </div>
      )}
    </div>
  );
});