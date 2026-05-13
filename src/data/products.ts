import type { ProductCatalog, BagColor, BagSize } from '@/types/products';

/** Shared color palette used across products */
export const sharedColors: BagColor[] = [
  { id: 'natural', nameKey: 'colors.natural', hex: '#F5F0E8', twClass: 'bg-[#F5F0E8]' },
  { id: 'white', nameKey: 'colors.white', hex: '#FFFFFF', twClass: 'bg-white' },
  { id: 'black', nameKey: 'colors.black', hex: '#1A1A1A', twClass: 'bg-[#1A1A1A]' },
  { id: 'forest', nameKey: 'colors.forest', hex: '#064E3B', twClass: 'bg-brand-900' },
  { id: 'navy', nameKey: 'colors.navy', hex: '#1E3A5F', twClass: 'bg-[#1E3A5F]' },
  { id: 'burgundy', nameKey: 'colors.burgundy', hex: '#722F37', twClass: 'bg-[#722F37]' },
  { id: 'sand', nameKey: 'colors.sand', hex: '#C2B280', twClass: 'bg-[#C2B280]' },
  { id: 'sage', nameKey: 'colors.sage', hex: '#9CAF88', twClass: 'bg-[#9CAF88]' },
];

const sharedPrintArea = {
  centerHeightRatio: 0.58,
  logoWidthRatio: 0.42,
  textWidthRatio: 0.62,
  textOffsetRatio: 0.14,
} as const;

const printAreasByFamily = {
  pizza: {
    centerHeightRatio: 0.55,
    logoWidthRatio: 0.62,
    textWidthRatio: 0.84,
    textOffsetRatio: 0.13,
  },
  takeaway: {
    centerHeightRatio: 0.575,
    logoWidthRatio: 0.56,
    textWidthRatio: 0.78,
    textOffsetRatio: 0.13,
  },
  retail: {
    centerHeightRatio: 0.59,
    logoWidthRatio: 0.52,
    textWidthRatio: 0.74,
    textOffsetRatio: 0.12,
  },
} as const;

const defaultLogoScaleByFamily: Record<'pizza' | 'takeaway' | 'retail', number> = {
  pizza: 1.24,
  takeaway: 1.14,
  retail: 1.1,
};

function createRetailVariant({
  family,
  size,
  sizeLabel,
  width,
  depth,
  height,
  modelPath,
  colors,
  defaultColorId,
}: {
  family: 'pizza' | 'takeaway' | 'retail';
  size: BagSize;
  sizeLabel: string;
  width: number;
  depth: number;
  height: number;
  modelPath: string;
  colors: BagColor[];
  defaultColorId: string;
}) {
  return {
    id: `${family}-${size}`,
    category: 'retail' as const,
    family,
    size,
    nameKey: `products.retail.variants.${family}.name`,
    descriptionKey: `products.retail.variants.${family}.description`,
    sizeLabel,
    defaultLogoScale: defaultLogoScaleByFamily[family],
    colors,
    defaultColorId,
    placeholderImage: '/images/bags-showcase.png',
    modelPath,
    dimensions: { width, depth, height },
    printArea: printAreasByFamily[family] ?? sharedPrintArea,
    supportsText: true,
    supportsLogo: true,
  };
}

/**
 * Product catalog — the single source of truth for all bag products.
 *
 * To add a new category or variant:
 * 1. Add the variant here with a unique `id`.
 * 2. Add matching translation keys to messages/da.json and messages/en.json.
 * 3. Optionally add a 3D model path to `modelPath`.
 */
export const catalog: ProductCatalog = {
  categories: [
    {
      id: 'tote',
      nameKey: 'products.tote.name',
      descriptionKey: 'products.tote.description',
      taglineKey: 'products.tote.tagline',
      image: '/images/placeholder/tote-category.jpg',
      variants: [
        {
          id: 'tote-small',
          category: 'tote',
          family: 'tote',
          size: 'small',
          nameKey: 'products.tote.variants.classic.name',
          descriptionKey: 'products.tote.variants.classic.description',
          sizeLabel: '32 x 10 x 25 cm',
          defaultLogoScale: 1.0,
          colors: sharedColors,
          defaultColorId: 'natural',
          placeholderImage: '/images/placeholder/tote-classic.jpg',
          modelPath: '/models/bags/retail_320x100x250mm.glb',
          dimensions: { width: 0.32, depth: 0.10, height: 0.25 },
          printArea: {
            centerHeightRatio: 0.6,
            logoWidthRatio: 0.5,
            textWidthRatio: 0.7,
            textOffsetRatio: 0.12,
          },
          supportsText: true,
          supportsLogo: true,
        },
        {
          id: 'tote-medium',
          category: 'tote',
          family: 'tote',
          size: 'medium',
          nameKey: 'products.tote.variants.classic.name',
          descriptionKey: 'products.tote.variants.classic.description',
          sizeLabel: '42 x 12 x 35 cm',
          defaultLogoScale: 1.0,
          colors: sharedColors,
          defaultColorId: 'natural',
          placeholderImage: '/images/placeholder/tote-classic.jpg',
          modelPath: '/models/bags/retail_420x120x350mm.glb',
          dimensions: { width: 0.42, depth: 0.12, height: 0.35 },
          printArea: {
            centerHeightRatio: 0.6,
            logoWidthRatio: 0.5,
            textWidthRatio: 0.7,
            textOffsetRatio: 0.12,
          },
          supportsText: true,
          supportsLogo: true,
        },
        {
          id: 'tote-large',
          category: 'tote',
          family: 'tote',
          size: 'large',
          nameKey: 'products.tote.variants.classic.name',
          descriptionKey: 'products.tote.variants.classic.description',
          sizeLabel: '50 x 15 x 45 cm',
          defaultLogoScale: 1.0,
          colors: sharedColors,
          defaultColorId: 'natural',
          placeholderImage: '/images/placeholder/tote-classic.jpg',
          modelPath: '/models/bags/retail_500x150x450mm.glb',
          dimensions: { width: 0.50, depth: 0.15, height: 0.45 },
          printArea: {
            centerHeightRatio: 0.6,
            logoWidthRatio: 0.5,
            textWidthRatio: 0.7,
            textOffsetRatio: 0.12,
          },
          supportsText: true,
          supportsLogo: true,
        },
      ],
    },
    {
      id: 'retail',
      nameKey: 'products.retail.name',
      descriptionKey: 'products.retail.description',
      taglineKey: 'products.retail.tagline',
      image: '/images/placeholder/retail-category.jpg',
      variants: [
        createRetailVariant({
          family: 'pizza',
          size: 'small',
          sizeLabel: '24 x 24 x 15 cm',
          width: 0.24,
          depth: 0.24,
          height: 0.15,
          modelPath: '/models/bags/pizza_240x240x150mm.glb',
          colors: sharedColors.filter((c) => ['white', 'natural', 'black', 'forest'].includes(c.id)),
          defaultColorId: 'white',
        }),
        createRetailVariant({
          family: 'pizza',
          size: 'medium',
          sizeLabel: '36 x 33 x 26 cm',
          width: 0.36,
          depth: 0.33,
          height: 0.26,
          modelPath: '/models/bags/pizza_360x330x260mm.glb',
          colors: sharedColors.filter((c) => ['white', 'natural', 'black', 'forest'].includes(c.id)),
          defaultColorId: 'white',
        }),
        createRetailVariant({
          family: 'pizza',
          size: 'large',
          sizeLabel: '50 x 50 x 20 cm',
          width: 0.5,
          depth: 0.5,
          height: 0.2,
          modelPath: '/models/bags/pizza_500x500x200mm.glb',
          colors: sharedColors.filter((c) => ['white', 'natural', 'black', 'forest'].includes(c.id)),
          defaultColorId: 'white',
        }),
        createRetailVariant({
          family: 'takeaway',
          size: 'small',
          sizeLabel: '25 x 18 x 25 cm',
          width: 0.25,
          depth: 0.18,
          height: 0.25,
          modelPath: '/models/bags/takeaway_250x180x250mm.glb',
          colors: sharedColors.filter((c) => ['white', 'natural', 'black', 'sand'].includes(c.id)),
          defaultColorId: 'natural',
        }),
        createRetailVariant({
          size: 'medium',
          family: 'takeaway',
          sizeLabel: '35 x 17 x 24.5 cm',
          width: 0.35,
          depth: 0.17,
          height: 0.245,
          modelPath: '/models/bags/takeaway_350x170x245mm.glb',
          colors: sharedColors.filter((c) => ['white', 'natural', 'black', 'sand'].includes(c.id)),
          defaultColorId: 'natural',
        }),
        createRetailVariant({
          family: 'takeaway',
          size: 'large',
          sizeLabel: '36 x 33 x 26 cm',
          width: 0.36,
          depth: 0.33,
          height: 0.26,
          modelPath: '/models/bags/takeaway_360x330x260mm.glb',
          colors: sharedColors.filter((c) => ['white', 'natural', 'black', 'sand'].includes(c.id)),
          defaultColorId: 'natural',
        }),
        createRetailVariant({
          family: 'retail',
          size: 'small',
          sizeLabel: '32 x 10 x 25 cm',
          width: 0.32,
          depth: 0.1,
          height: 0.25,
          modelPath: '/models/bags/retail_320x100x250mm.glb',
          colors: sharedColors,
          defaultColorId: 'natural',
        }),
        createRetailVariant({
          family: 'retail',
          size: 'medium',
          sizeLabel: '42 x 12 x 35 cm',
          width: 0.42,
          depth: 0.12,
          height: 0.35,
          modelPath: '/models/bags/retail_420x120x350mm.glb',
          colors: sharedColors,
          defaultColorId: 'natural',
        }),
        createRetailVariant({
          family: 'retail',
          size: 'large',
          sizeLabel: '50 x 15 x 45 cm',
          width: 0.5,
          depth: 0.15,
          height: 0.45,
          modelPath: '/models/bags/retail_500x150x450mm.glb',
          colors: sharedColors,
          defaultColorId: 'natural',
        }),
      ],
    },
  ],
};

/** Helper: find a category by its ID */
export function getCategoryById(id: string) {
  return catalog.categories.find((c) => c.id === id);
}

/** Helper: find a variant by its ID across all categories */
export function getVariantById(variantId: string) {
  for (const category of catalog.categories) {
    const variant = category.variants.find((v) => v.id === variantId);
    if (variant) return variant;
  }
  return undefined;
}

/** Helper: get all variants for a category */
export function getVariantsByCategory(categoryId: string) {
  const category = getCategoryById(categoryId);
  return category?.variants ?? [];
}
