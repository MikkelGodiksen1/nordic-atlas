'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { BagFamily, BagSize, BagVariant } from '@/types/products';
import { ColorPicker } from './ColorPicker';
import { LogoUploader } from './LogoUploader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';

interface ConfigPanelProps {
  variants: BagVariant[];
  selectedVariantId: string;
  selectedFamily: BagFamily;
  selectedSize: BagSize;
  selectedColorId: string;
  logoPreviewUrl: string | null;
  customText: string;
  logoScale: number;
  removeWhiteBackground: boolean;
  showVariantSelector?: boolean;
  onSelectFamily: (family: BagFamily) => void;
  onSelectSize: (size: BagSize) => void;
  onSelectColor: (id: string) => void;
  onUploadLogo: (file: File) => void;
  onRemoveLogo: () => void;
  onChangeText: (text: string) => void;
  onChangeLogoScale: (scale: number) => void;
  onToggleWhiteBackground: (enabled: boolean) => void;
  onReset: () => void;
  onSubmit: () => void;
}

const SIZE_ORDER: BagSize[] = ['small', 'medium', 'large'];

function sizeKey(size: BagSize) {
  return `size${size.charAt(0).toUpperCase()}${size.slice(1)}` as const;
}

export function ConfigPanel({
  variants,
  selectedVariantId,
  selectedFamily,
  selectedSize,
  selectedColorId,
  logoPreviewUrl,
  customText,
  logoScale,
  removeWhiteBackground,
  showVariantSelector = false,
  onSelectFamily,
  onSelectSize,
  onSelectColor,
  onUploadLogo,
  onRemoveLogo,
  onChangeText,
  onChangeLogoScale,
  onToggleWhiteBackground,
  onReset,
  onSubmit,
}: ConfigPanelProps) {
  const t = useTranslations('configurator');
  const tGlobal = useTranslations();
  const currentVariant = variants.find((variant) => variant.id === selectedVariantId);

  const familyOptions = useMemo(() => {
    const grouped = new Map<BagFamily, BagVariant>();

    for (const variant of variants) {
      if (!grouped.has(variant.family)) {
        grouped.set(variant.family, variant);
      }
    }

    return Array.from(grouped.values());
  }, [variants]);

  const sizeOptions = useMemo(() => (
    variants
      .filter((variant) => variant.family === selectedFamily)
      .sort((left, right) => SIZE_ORDER.indexOf(left.size) - SIZE_ORDER.indexOf(right.size))
  ), [selectedFamily, variants]);

  return (
    <div className="space-y-7">
      {showVariantSelector && familyOptions.length > 1 && (
        <div className="space-y-5">
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-900">
              {t('selectCategory')}
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {familyOptions.map((variant) => {
                const isSelected = variant.family === selectedFamily;
                return (
                  <button
                    key={variant.family}
                    onClick={() => onSelectFamily(variant.family)}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-1 ring-brand-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <p className={cn(
                      'text-sm font-semibold',
                      isSelected ? 'text-brand-900' : 'text-slate-900'
                    )}>
                      {tGlobal(variant.nameKey)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {tGlobal(variant.descriptionKey)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {sizeOptions.length > 0 && (
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-900">
                {t('selectSize')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.map((variant) => {
                  const isSelected = variant.size === selectedSize;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => onSelectSize(variant.size)}
                      className={cn(
                        'rounded-2xl border px-3 py-3 text-left transition-all duration-200',
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-1 ring-brand-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <p className={cn(
                        'text-sm font-semibold uppercase tracking-[0.12em]',
                        isSelected ? 'text-brand-900' : 'text-slate-800'
                      )}>
                        {t(sizeKey(variant.size))}
                      </p>
                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
                        {variant.sizeLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {currentVariant && (
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-900">
            {t('selectColor')}
          </label>
          <ColorPicker
            colors={currentVariant.colors}
            selectedId={selectedColorId}
            onSelect={onSelectColor}
          />
        </div>
      )}

      {currentVariant?.supportsLogo && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-900">
              {t('uploadLogo')}
            </label>
            <p className="mb-3 text-xs text-slate-500">{t('uploadLogoDescription')}</p>
            <LogoUploader
              logoPreviewUrl={logoPreviewUrl}
              onUpload={onUploadLogo}
              onRemove={onRemoveLogo}
            />
          </div>

          <div className={cn('space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4', !logoPreviewUrl && 'opacity-60')}>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <label className="text-sm font-semibold text-slate-900">
                  {t('logoScale')}
                </label>
                <span className="text-xs font-medium text-slate-500">
                  {Math.round(logoScale * 100)}%
                </span>
              </div>
              <p className="mb-3 text-xs text-slate-500">{t('logoScaleDescription')}</p>
              <input
                type="range"
                min={0.55}
                max={2.4}
                step={0.05}
                value={logoScale}
                disabled={!logoPreviewUrl}
                onChange={(event) => onChangeLogoScale(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-700 disabled:cursor-not-allowed"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={removeWhiteBackground}
                disabled={!logoPreviewUrl}
                onChange={(event) => onToggleWhiteBackground(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500 disabled:cursor-not-allowed"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {t('removeWhiteBackground')}
                </p>
                <p className="text-xs text-slate-500">
                  {t('removeWhiteBackgroundDescription')}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {currentVariant?.supportsText && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-900">
            {t('addText')}
          </label>
          <p className="mb-3 text-xs text-slate-500">{t('addTextDescription')}</p>
          <input
            type="text"
            value={customText}
            onChange={(event) => onChangeText(event.target.value)}
            placeholder={t('addTextPlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Button onClick={onSubmit} variant="primary" size="md" className="w-full">
          {t('getPreview')}
        </Button>
        <p className="text-center text-xs text-slate-500 leading-snug">
          {t('getPreviewHint')}
        </p>
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-slate-500 transition-colors hover:text-slate-700"
        >
          <RotateCcw size={12} />
          {t('resetDesign')}
        </button>
      </div>
    </div>
  );
}
