import type { BagDimensions, BagPrintArea, ProductCategory } from './products';

/** State of the bag configurator */
export interface ConfiguratorState {
  /** Selected product category */
  category: ProductCategory;
  /** Selected bag variant ID */
  variantId: string;
  /** Selected color ID */
  colorId: string;
  /** Uploaded logo file (client-side) */
  logoFile: File | null;
  /** Preview URL for the uploaded logo */
  logoPreviewUrl: string | null;
  /** Optional text below the logo (e.g., website URL) */
  customText: string;
  /** Relative scale applied to the uploaded logo */
  logoScale: number;
  /** Whether white pixels should be punched out from the uploaded artwork */
  removeWhiteBackground: boolean;
  /** Whether the user has modified the configuration */
  isDirty: boolean;
}

/** Inquiry form data submitted by the customer */
export interface InquiryFormData {
  /** Customer name */
  name: string;
  /** Company name */
  company: string;
  /** Email address */
  email: string;
  /** Phone number (optional) */
  phone: string;
  /** Additional notes */
  notes: string;
  /** The configurator state at time of submission */
  configuration: Omit<ConfiguratorState, 'logoFile' | 'isDirty'>;
}

/** Submission status for the inquiry */
export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

/** Props for the 3D viewer component (future implementation) */
export interface ViewerProps {
  /** Path to the 3D model */
  modelPath?: string;
  /** Current variant label */
  variantLabel: string;
  /** Optional size label */
  sizeLabel?: string;
  /** Current color hex value */
  colorHex: string;
  /** Logo texture URL (if uploaded) */
  logoUrl: string | null;
  /** Current logo scale multiplier */
  logoScale: number;
  /** Whether white pixels should be converted to transparency */
  removeWhiteBackground: boolean;
  /** Custom text to render on the bag */
  customText: string;
  /** Real-world bag dimensions */
  dimensions?: BagDimensions;
  /** Print-area placement rules */
  printArea?: BagPrintArea;
  /** Multiplier applied to handle height so totes can stretch them taller than retail bags */
  handleStretch?: number;
}

/** Export/download options */
export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  width: number;
  height: number;
}
