'use client';

import { useTranslations } from 'next-intl';
import type { ViewerProps } from '@/types/configurator';
import { cn } from '@/lib/utils';
import { ProductScene } from './ProductScene';

function PlaceholderBag({
  colorHex,
  logoUrl,
  customText,
  label,
}: {
  colorHex: string;
  logoUrl: string | null;
  customText: string;
  label: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div
        className="relative flex h-56 w-48 flex-col items-center justify-center rounded-b-xl rounded-t-3xl shadow-lg transition-colors duration-500 md:h-64 md:w-56"
        style={{ backgroundColor: colorHex }}
      >
        <div
          className="absolute left-1/2 top-[-1.5rem] h-8 w-24 -translate-x-1/2 rounded-t-full border-4 border-b-0 transition-colors duration-500"
          style={{ borderColor: colorHex === '#FFFFFF' || colorHex === '#F5F0E8' ? '#d1d5db' : colorHex }}
        />

        {logoUrl ? (
          <div className="mb-2 h-20 w-20 overflow-hidden rounded-lg bg-white/20 p-2 backdrop-blur-sm md:h-24 md:w-24">
            <img src={logoUrl} alt="Logo preview" className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-white/30 md:h-24 md:w-24">
            <span
              className={cn(
                'px-2 text-center text-xs',
                colorHex === '#FFFFFF' || colorHex === '#F5F0E8' ? 'text-slate-400' : 'text-white/50'
              )}
            >
              Logo
            </span>
          </div>
        )}

        {customText && (
          <p
            className={cn(
              'max-w-full truncate px-4 text-center text-xs font-medium',
              colorHex === '#FFFFFF' || colorHex === '#F5F0E8' ? 'text-slate-600' : 'text-white/80'
            )}
          >
            {customText}
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-xs uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

export function ProductViewer({
  modelPath,
  variantLabel,
  sizeLabel,
  colorHex,
  logoUrl,
  logoScale,
  removeWhiteBackground,
  customText,
  dimensions,
  printArea,
  handleStretch,
  depthScale,
}: ViewerProps) {
  const t = useTranslations('configurator');
  const has3DModel = Boolean(modelPath && dimensions);
  const label = sizeLabel ? `${variantLabel} - ${sizeLabel}` : variantLabel;

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100 md:aspect-[4/3]">
      {has3DModel ? (
        <ProductScene
          modelPath={modelPath}
          colorHex={colorHex}
          logoUrl={logoUrl}
          logoScale={logoScale}
          removeWhiteBackground={removeWhiteBackground}
          customText={customText}
          dimensions={dimensions}
          printArea={printArea}
          handleStretch={handleStretch}
          depthScale={depthScale}
        />
      ) : (
        <PlaceholderBag
          colorHex={colorHex}
          logoUrl={logoUrl}
          customText={customText}
          label={label}
        />
      )}

      <div className="pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1.5 glass-card">
        <p className="text-[10px] font-medium text-slate-500">
          {has3DModel ? t('viewerReady') : t('viewerModelMissing')}
        </p>
      </div>

      {has3DModel && (
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 shadow-sm backdrop-blur">
          {t('viewerHint')}
        </div>
      )}
    </div>
  );
}
