'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ConfiguratorState, InquiryFormData, SubmissionStatus } from '@/types/configurator';
import type { ProductCategory, BagFamily, BagSize } from '@/types/products';
import { getVariantById, getVariantsByCategory } from '@/data/products';

interface UseConfiguratorOptions {
  category: ProductCategory;
  initialVariantId?: string;
}

export function useConfigurator({ category, initialVariantId }: UseConfiguratorOptions) {
  const variants = useMemo(() => getVariantsByCategory(category), [category]);
  const defaultVariant = initialVariantId
    ? getVariantById(initialVariantId)
    : variants.find((variant) => variant.family === 'pizza' && variant.size === 'medium')
      ?? variants.find((variant) => variant.family === 'tote' && variant.size === 'medium')
      ?? variants.find((variant) => variant.size === 'medium')
      ?? variants[0];

  const [state, setState] = useState<ConfiguratorState>({
    category,
    variantId: defaultVariant?.id ?? '',
    colorId: defaultVariant?.defaultColorId ?? '',
    logoFile: null,
    logoPreviewUrl: null,
    customText: '',
    logoScale: defaultVariant?.defaultLogoScale ?? 1,
    removeWhiteBackground: false,
    isDirty: false,
  });

  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');

  const currentVariant = useMemo(
    () => getVariantById(state.variantId),
    [state.variantId]
  );

  const currentColor = useMemo(
    () => currentVariant?.colors.find((c) => c.id === state.colorId),
    [currentVariant, state.colorId]
  );

  const currentFamily = currentVariant?.family ?? variants[0]?.family ?? 'pizza';
  const currentSize = currentVariant?.size ?? variants[0]?.size ?? 'medium';

  const resolveNextColor = useCallback((variantId: string, currentColorId: string) => {
    const variant = getVariantById(variantId);
    if (!variant) return currentColorId;
    return variant.colors.some((color) => color.id === currentColorId)
      ? currentColorId
      : variant.defaultColorId;
  }, []);

  const selectVariant = useCallback((variantId: string) => {
    const variant = getVariantById(variantId);
    if (!variant) return;
    setState((prev) => ({
      ...prev,
      variantId,
      colorId: resolveNextColor(variantId, prev.colorId),
      logoScale: variant.defaultLogoScale ?? prev.logoScale,
      isDirty: true,
    }));
  }, [resolveNextColor]);

  const selectFamily = useCallback((family: BagFamily) => {
    setState((prev) => {
      const activeVariant = getVariantById(prev.variantId);
      const preferredSizes: BagSize[] = [
        activeVariant?.size ?? 'medium',
        'medium',
        'small',
        'large',
      ];
      const nextVariant = preferredSizes
        .map((size) => variants.find((variant) => variant.family === family && variant.size === size))
        .find(Boolean);

      if (!nextVariant) return prev;

      return {
        ...prev,
        variantId: nextVariant.id,
        colorId: resolveNextColor(nextVariant.id, prev.colorId),
        logoScale: nextVariant.defaultLogoScale ?? prev.logoScale,
        isDirty: true,
      };
    });
  }, [resolveNextColor, variants]);

  const selectSize = useCallback((size: BagSize) => {
    setState((prev) => {
      const activeVariant = getVariantById(prev.variantId);
      const family = activeVariant?.family ?? variants[0]?.family;
      if (!family) return prev;

      const nextVariant = variants.find((variant) => variant.family === family && variant.size === size);
      if (!nextVariant) return prev;

      return {
        ...prev,
        variantId: nextVariant.id,
        colorId: resolveNextColor(nextVariant.id, prev.colorId),
        logoScale: nextVariant.defaultLogoScale ?? prev.logoScale,
        isDirty: true,
      };
    });
  }, [resolveNextColor, variants]);

  const selectColor = useCallback((colorId: string) => {
    setState((prev) => ({ ...prev, colorId, isDirty: true }));
  }, []);

  const uploadLogo = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setState((prev) => {
      // Revoke previous URL to prevent memory leaks
      if (prev.logoPreviewUrl) URL.revokeObjectURL(prev.logoPreviewUrl);
      return {
        ...prev,
        logoFile: file,
        logoPreviewUrl: url,
        removeWhiteBackground: file.type === 'image/jpeg' || file.type === 'image/jpg',
        isDirty: true,
      };
    });
  }, []);

  const removeLogo = useCallback(() => {
    setState((prev) => {
      if (prev.logoPreviewUrl) URL.revokeObjectURL(prev.logoPreviewUrl);
      return {
        ...prev,
        logoFile: null,
        logoPreviewUrl: null,
        removeWhiteBackground: false,
        isDirty: true,
      };
    });
  }, []);

  const setCustomText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, customText: text, isDirty: true }));
  }, []);

  const setLogoScale = useCallback((logoScale: number) => {
    setState((prev) => ({ ...prev, logoScale, isDirty: true }));
  }, []);

  const setRemoveWhiteBackground = useCallback((removeWhiteBackground: boolean) => {
    setState((prev) => ({ ...prev, removeWhiteBackground, isDirty: true }));
  }, []);

  const resetDesign = useCallback(() => {
    setState((prev) => {
      if (prev.logoPreviewUrl) URL.revokeObjectURL(prev.logoPreviewUrl);
      return {
        category,
        variantId: defaultVariant?.id ?? '',
        colorId: defaultVariant?.defaultColorId ?? '',
        logoFile: null,
        logoPreviewUrl: null,
        customText: '',
        logoScale: defaultVariant?.defaultLogoScale ?? 1,
        removeWhiteBackground: false,
        isDirty: false,
      };
    });
  }, [category, defaultVariant]);

  useEffect(() => {
    setState((prev) => {
      if (prev.category === category) return prev;
      if (prev.logoPreviewUrl) {
        URL.revokeObjectURL(prev.logoPreviewUrl);
      }
      return {
        category,
        variantId: defaultVariant?.id ?? '',
        colorId: defaultVariant?.defaultColorId ?? '',
        logoFile: null,
        logoPreviewUrl: null,
        customText: '',
        logoScale: defaultVariant?.defaultLogoScale ?? 1,
        removeWhiteBackground: false,
        isDirty: false,
      };
    });
  }, [category, defaultVariant]);

  useEffect(() => {
    const previewUrl = state.logoPreviewUrl;
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [state.logoPreviewUrl]);

  /**
   * Submit the design inquiry — POSTs to /api/leads with preview image.
   */
  const submitInquiry = useCallback(
    async (
      formData: Omit<InquiryFormData, 'configuration'>,
      previewImage?: string | null
    ) => {
      setSubmissionStatus('submitting');

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            company: formData.company,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes,
            category: state.category,
            variantId: state.variantId,
            colorId: state.colorId,
            customText: state.customText,
            logoScale: state.logoScale,
            removeWhiteBackground: state.removeWhiteBackground,
            previewImage: previewImage ?? null,
          }),
        });

        if (!response.ok) {
          setSubmissionStatus('error');
          return;
        }
        setSubmissionStatus('success');
      } catch {
        setSubmissionStatus('error');
      }
    },
    [state]
  );

  return {
    state,
    variants,
    currentVariant,
    currentColor,
    currentFamily,
    currentSize,
    submissionStatus,
    selectVariant,
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
    setSubmissionStatus,
  };
}
