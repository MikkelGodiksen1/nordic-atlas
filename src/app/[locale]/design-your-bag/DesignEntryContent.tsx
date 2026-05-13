'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CategoryCard } from '@/components/design/CategoryCard';

export function DesignEntryContent() {
  const t = useTranslations('designEntry');

  return (
    <section className="min-h-screen pt-8 pb-20 md:pt-16 md:pb-28">
      {/* Background */}
      <div className="fixed inset-0 gradient-subtle -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%)] -z-10" />

      <div className="container-width">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          <CategoryCard
            title={t('tote.title')}
            description={t('tote.description')}
            cta={t('tote.cta')}
            href="/configurator/tote"
            modelPath="/models/bags/retail_420x120x350mm.glb"
            dimensions={{ width: 0.42, depth: 0.12, height: 0.35 }}
            backgroundClass="bg-gradient-to-br from-slate-50 to-slate-100"
            handleStretch={2.4}
            index={0}
          />
          <CategoryCard
            title={t('retail.title')}
            description={t('retail.description')}
            cta={t('retail.cta')}
            href="/configurator/retail"
            modelPath="/models/bags/takeaway_360x330x260mm.glb"
            dimensions={{ width: 0.36, depth: 0.33, height: 0.26 }}
            backgroundClass="bg-gradient-to-br from-slate-50 to-slate-100"
            index={1}
          />
        </div>
      </div>
    </section>
  );
}
