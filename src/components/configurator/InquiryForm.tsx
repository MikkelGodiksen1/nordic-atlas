'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import type { SubmissionStatus } from '@/types/configurator';
import { CheckCircle, ArrowLeft, Home, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface InquiryFormProps {
  status: SubmissionStatus;
  previewImage?: string | null;
  onSubmit: (data: {
    name: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
  }) => void;
  onDownload?: () => void;
  onBack: () => void;
}

export function InquiryForm({
  status,
  previewImage,
  onSubmit,
  onDownload,
  onBack,
}: InquiryFormProps) {
  const t = useTranslations('inquiry');
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t('required');
    if (!form.company.trim()) errs.company = t('required');
    if (!form.email.trim()) errs.email = t('required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('invalidEmail');
    if (!form.phone.trim()) errs.phone = t('required');
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(form);
  }

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard variant="elevated" className="text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 flex items-center justify-center mb-5">
            <CheckCircle size={32} className="text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            {t('success.title')}
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6">
            {t('success.description')}
          </p>

          {previewImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage}
              alt="Preview"
              className="w-full rounded-xl border border-slate-200 mb-5"
            />
          )}

          {onDownload && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onDownload}
              className="w-full mb-3"
            >
              <Download size={16} />
              {t('success.download')}
            </Button>
          )}

          <p className="text-sm text-slate-500 italic mb-6">
            {t('success.note')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/design-your-bag"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-brand-800 border border-brand-200 rounded-full hover:bg-brand-50 transition-colors"
            >
              <ArrowLeft size={16} />
              {t('success.backToDesign')}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full gradient-brand"
            >
              <Home size={16} />
              {t('success.backToHome')}
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard variant="elevated" className="max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{t('title')}</h3>
        <p className="text-sm text-slate-500 mb-6">{t('subtitle')}</p>

        {previewImage && (
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Preview"
              className="w-full rounded-xl border border-slate-200"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('namePlaceholder')}
              className={`${inputClass} ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('company')}</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder={t('companyPlaceholder')}
              className={`${inputClass} ${errors.company ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder={t('emailPlaceholder')}
              className={`${inputClass} ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone')}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder={t('phonePlaceholder')}
              className={`${inputClass} ${errors.phone ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('notes')}</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={3}
              className={`${inputClass} border-slate-200 resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" size="md" onClick={onBack} className="flex-1">
              <ArrowLeft size={16} />
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={status === 'submitting'}
              className="flex-[3]"
            >
              {status === 'submitting' ? t('submitting') : t('submit')}
            </Button>
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-500 text-center">{t('errorMessage')}</p>
          )}
        </form>
      </GlassCard>
    </motion.div>
  );
}
