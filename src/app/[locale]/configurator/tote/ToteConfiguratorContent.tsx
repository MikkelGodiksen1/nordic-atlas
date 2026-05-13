'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useConfigurator } from '@/hooks/useConfigurator';
import { usePreviewExport } from '@/components/configurator/PreviewExport';
import { ProductViewer } from '@/components/configurator/ProductViewer';
import { ConfigPanel } from '@/components/configurator/ConfigPanel';
import { InquiryForm } from '@/components/configurator/InquiryForm';
import { GlassCard } from '@/components/ui/GlassCard';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToteConfiguratorContent() {
  const t = useTranslations('configurator');
  const tGlobal = useTranslations();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  const {
    state,
    variants,
    currentVariant,
    currentColor,
    currentFamily,
    currentSize,
    submissionStatus,
    selectFamily,
    selectSize,
    selectColor,
    uploadLogo,
    removeLogo,
    setCustomText,
    setLogoScale,
    setRemoveWhiteBackground,
    resetDesign,
    submitInquiry,
  } = useConfigurator({ category: 'tote' });

  const { capturePreview, downloadPreview } = usePreviewExport({
    viewerRef,
    variantId: state.variantId,
    colorId: state.colorId,
  });

  async function handleOpenInquiry() {
    const preview = await capturePreview();
    setPendingPreview(preview);
    setShowInquiry(true);
  }

  return (
    <section className="min-h-screen pt-4 pb-16 md:pt-8 md:pb-24">
      <div className="fixed inset-0 gradient-subtle -z-10" />

      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/design-your-bag"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            {t('backToCategories')}
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {showInquiry ? (
            <InquiryForm
              key="inquiry"
              status={submissionStatus}
              previewImage={pendingPreview}
              onSubmit={(formData) => submitInquiry(formData, pendingPreview)}
              onDownload={() => downloadPreview(pendingPreview)}
              onBack={() => setShowInquiry(false)}
            />
          ) : (
            <motion.div
              key="configurator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8"
            >
              <div className="lg:col-span-3" ref={viewerRef}>
                <GlassCard variant="elevated" padding="sm">
                  <ProductViewer
                    modelPath={currentVariant?.modelPath}
                    variantLabel={currentVariant ? tGlobal(currentVariant.nameKey) : state.variantId}
                    sizeLabel={currentVariant?.sizeLabel}
                    colorHex={currentColor?.hex ?? '#F5F0E8'}
                    logoUrl={state.logoPreviewUrl}
                    logoScale={state.logoScale}
                    removeWhiteBackground={state.removeWhiteBackground}
                    customText={state.customText}
                    dimensions={currentVariant?.dimensions}
                    printArea={currentVariant?.printArea}
                  />
                </GlassCard>
              </div>

              <div className="lg:col-span-2">
                <GlassCard variant="elevated" padding="md">
                  <ConfigPanel
                    variants={variants}
                    selectedVariantId={state.variantId}
                    selectedFamily={currentFamily}
                    selectedSize={currentSize}
                    selectedColorId={state.colorId}
                    logoPreviewUrl={state.logoPreviewUrl}
                    customText={state.customText}
                    logoScale={state.logoScale}
                    removeWhiteBackground={state.removeWhiteBackground}
                    showVariantSelector={false}
                    onSelectFamily={selectFamily}
                    onSelectSize={selectSize}
                    onSelectColor={selectColor}
                    onUploadLogo={uploadLogo}
                    onRemoveLogo={removeLogo}
                    onChangeText={setCustomText}
                    onChangeLogoScale={setLogoScale}
                    onToggleWhiteBackground={setRemoveWhiteBackground}
                    onReset={resetDesign}
                    onSubmit={handleOpenInquiry}
                  />
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
