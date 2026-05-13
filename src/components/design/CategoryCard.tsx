'use client';

import { Link } from '@/i18n/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BagCardPreview } from './BagCardPreview';

interface CategoryCardProps {
  title: string;
  description: string;
  cta: string;
  href: '/configurator/tote' | '/configurator/retail';
  modelPath: string;
  dimensions: { width: number; depth: number; height: number };
  backgroundClass: string;
  handleStretch?: number;
  index: number;
}

export function CategoryCard({
  title,
  description,
  cta,
  href,
  modelPath,
  dimensions,
  backgroundClass,
  handleStretch,
  index,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={href} className="group block">
        <GlassCard hover variant="elevated" padding="none" className="overflow-hidden">
          <div className={`relative aspect-[16/10] ${backgroundClass}`}>
            <div className="absolute inset-0">
              <BagCardPreview
                modelPath={modelPath}
                dimensions={dimensions}
                handleStretch={handleStretch}
              />
            </div>
          </div>

          <div className="p-7 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-800 transition-colors">
              {title}
            </h3>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6">
              {description}
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 group-hover:text-brand-600 transition-colors">
              {cta}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
