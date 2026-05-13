'use client';

import { useCallback, useState } from 'react';

interface PreviewExportProps {
  viewerRef: React.RefObject<HTMLDivElement | null>;
  variantId: string;
  colorId: string;
}

async function captureViewer(element: HTMLDivElement): Promise<string | null> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    backgroundColor: '#f8fafc',
    scale: 2,
    useCORS: true,
  });
  return canvas.toDataURL('image/png');
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function usePreviewExport({ viewerRef, variantId, colorId }: PreviewExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const capturePreview = useCallback(async (): Promise<string | null> => {
    if (!viewerRef.current) return null;
    setIsExporting(true);
    try {
      return await captureViewer(viewerRef.current);
    } catch (error) {
      console.error('Capture failed:', error);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [viewerRef]);

  const downloadPreview = useCallback(
    (dataUrl?: string | null) => {
      const filename = `nordic-atlas-${variantId}-${colorId}.png`;
      if (dataUrl) {
        downloadDataUrl(dataUrl, filename);
        return;
      }
      // Fallback: capture and download
      if (!viewerRef.current) return;
      void captureViewer(viewerRef.current).then((data) => {
        if (data) downloadDataUrl(data, filename);
      });
    },
    [viewerRef, variantId, colorId]
  );

  return { capturePreview, downloadPreview, isExporting };
}
