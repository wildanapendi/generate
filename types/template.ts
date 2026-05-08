/**
 * Shared template config shape used by Template Designer & Preview/Export.
 * Stored in `templates.config` (jsonb).
 */
export interface TemplateConfig {
  cover: CoverConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  watermark: WatermarkConfig;
  layout: LayoutConfig;
  typography: TypographyConfig;
}

export interface CoverConfig {
  enabled: boolean;
  title?: string; // overrides module title if set
  subtitle?: string;
  logoUrl?: string;
  logoPosition?: "top" | "center";
  logoSize?: number; // px
  backgroundUrl?: string;
  backgroundColor?: string; // hex/oklch
  showLecturer?: boolean;
  showProgram?: boolean;
  showAcademicYear?: boolean;
}

export interface HeaderConfig {
  enabled: boolean;
  text?: string;
  showLogo?: boolean;
  logoUrl?: string;
  height?: number; // px
  differentFirstPage?: boolean;
}

export interface FooterConfig {
  enabled: boolean;
  text?: string;
  showPageNumber?: boolean;
  showCopyright?: boolean;
  copyright?: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  imageUrl?: string;
  opacity?: number; // 0..1
  rotation?: number; // deg
  position?: "center" | "diagonal";
}

export interface LayoutConfig {
  pageSize: "A4" | "F4" | "Letter";
  orientation: "portrait" | "landscape";
  marginTop: number; // mm
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  columns: 1 | 2;
  lineSpacing: number;
}

export interface TypographyConfig {
  fontFamily: "inter" | "poppins" | "serif" | "mono";
  headingFamily?: "inter" | "poppins" | "serif" | "mono";
  baseSize: number; // px
  headingScale: number;
  paragraphSpacing: number; // px
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  cover: {
    enabled: true,
    showLecturer: true,
    showProgram: true,
    showAcademicYear: true,
    logoPosition: "top",
    logoSize: 96,
    backgroundColor: "#ffffff",
  },
  header: {
    enabled: true,
    showLogo: false,
    height: 48,
    differentFirstPage: true,
  },
  footer: {
    enabled: true,
    showPageNumber: true,
    showCopyright: true,
  },
  watermark: {
    enabled: false,
    opacity: 0.08,
    rotation: -30,
    position: "diagonal",
  },
  layout: {
    pageSize: "A4",
    orientation: "portrait",
    marginTop: 25,
    marginRight: 20,
    marginBottom: 25,
    marginLeft: 25,
    columns: 1,
    lineSpacing: 1.5,
  },
  typography: {
    fontFamily: "inter",
    headingFamily: "inter",
    baseSize: 12,
    headingScale: 1.25,
    paragraphSpacing: 8,
  },
};

/** Page dimensions in mm. */
export const PAGE_SIZES_MM: Record<LayoutConfig["pageSize"], { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  F4: { w: 215, h: 330 },
  Letter: { w: 215.9, h: 279.4 },
};
