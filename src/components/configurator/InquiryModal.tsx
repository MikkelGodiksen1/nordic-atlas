'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import type { SubmissionStatus } from '@/types/configurator';
import { CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InquiryModalProps {
  open: boolean;
  status: SubmissionStatus;
  previewImage: string | null;
  onSubmit: (data: {
    name: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
  }) => Promise<void> | void;
  onAutoDownload: () => void;
  onClose: () => void;
}

export function InquiryModal({
  open,
  status,
  previewImage,
  onSubmit,
  onAutoDownload,
  onClose,
}: InquiryModalProps) {
  const t = useTranslations('inquiry');
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form whenever the modal is opened
  useEffect(() => {
    if (open) {
      setForm({ name: '', company: '', email: '', phone: '', notes: '' });
      setErrors({});
    }
  }, [open]);

  // Auto-download the preview as soon as submission succeeds
  useEffect(() => {
    if (status === 'success') {
      onAutoDownload();
    }
  }, [status, onAutoDownload]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

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
    if (status === 'submitting') return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    void onSubmit(form);
  }

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-slate-400';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t('title')}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t('subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Luk"
                className="text-slate-400 hover:text-slate-700 transition-colors -mr-2 -mt-1 p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5">
              {previewImage && (
                <div className="mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full rounded-xl border border-slate-200"
                  />
                </div>
              )}

              {status === 'success' ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 flex items-center justify-center mb-4">
                    <CheckCircle size={28} className="text-brand-600" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {t('success.title')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {t('success.description')}
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={onClose}
                    className="w-full"
                  >
                    {t('success.close')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className={`${inputClass} ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                      autoFocus
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('company')}
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      placeholder={t('companyPlaceholder')}
                      className={`${inputClass} ${errors.company ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {errors.company && (
                      <p className="text-xs text-red-500 mt-1">{errors.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('email')}
                    </label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('phone')}
                    </label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('notes')}
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      placeholder={t('notesPlaceholder')}
                      rows={3}
                      className={`${inputClass} border-slate-200 resize-none`}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={status === 'submitting'}
                    className="w-full"
                  >
                    {status === 'submitting' ? t('submitting') : t('submit')}
                  </Button>

                  {status === 'error' && (
                    <p className="text-sm text-red-500 text-center">{t('errorMessage')}</p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
