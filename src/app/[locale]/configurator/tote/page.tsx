import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ToteConfiguratorContent } from './ToteConfiguratorContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('configuratorToteTitle'),
  };
}

export default function ToteConfiguratorPage() {
  return <ToteConfiguratorContent />;
}
