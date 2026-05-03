export interface UrlData {
  title: string;
  image: string;
  logo: string;
  favicon: string;
  siteName: string;
  url: string;
}

export interface PhotocardData extends UrlData {
  weekName: string;
  date: string;
  // Comment card specific fields
  commentText?: string;
  personName?: string;
  personRole?: string;
  // Poll card specific fields
  pollTitle?: string;
  pollOptions?: Array<{ text: string; icon?: string }>;
}

export interface BackgroundOptions {
  type: "solid" | "gradient";
  color: string;
  gradientFrom?: string;
  gradientTo?: string;
  pattern?: string;
  patternColor?: string;
  patternOpacity?: number;
  patternImage?: string | null;
  patternScale?: number;
}

export interface MultiplePhotocardData {
  id: string;
  data: PhotocardData;
  status: "pending" | "loading" | "completed" | "error";
  error?: string;
}

export interface FontStyles {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing: string;
  textShadow?: {
    preset: "none" | "soft" | "hard" | "glow" | "outline";
    angle?: number;
  };
  textStroke?: {
    width: number; // 0-5px
    color: string; // hex color
  };
}

export interface CardFontStyles {
  week: FontStyles;
  date: FontStyles;
  headline: FontStyles;
  footer: FontStyles;
  weekDateLanguage?: "bangla" | "english";
  // Comment card specific fonts
  commentText?: FontStyles;
  personName?: FontStyles;
  personRole?: FontStyles;
  // Poll card specific fonts
  pollTitle?: FontStyles;
  pollOptions?: FontStyles;
}

export type FooterItemType = "facebook" | "instagram" | "youtube" | "twitter" | "tiktok" | "website" | "text";

export interface FooterItem {
  id: string;
  type: FooterItemType;
  value: string; // username, URL, or plain text
}

export interface FooterOverlaySettings {
  enabled: boolean;
  opacity: number;
}

export interface WatermarkSettings {
  text: string;
  opacity: number;
  x: number;
  y: number;
  fontSize?: number;
  rotation?: number;
  enabled?: boolean;
}

export interface VisibilitySettings {
  showWeek: boolean;
  showDate: boolean;
  showLogo: boolean;
  showQrCode: boolean;
  showTitle: boolean;
  showAdBanner: boolean;
  showFooter?: boolean; // optional - defaults to true when not set
}

export interface CommentCardVisibilitySettings {
  showLogo: boolean;
  showDate: boolean;
  showCommentText: boolean;
  showPersonName: boolean;
  showPersonRole: boolean;
  showImage: boolean;
  showSocialMedia: boolean;
  showAdBanner: boolean;
}

export interface PollCardVisibilitySettings {
  showLogo: boolean;
  showWeek: boolean;
  showDate: boolean;
  showPollTitle: boolean;
  showPollOptions: boolean;
  showPollIcons: boolean;
  showImage: boolean;
  showSocialMedia: boolean;
  showAdBanner: boolean;
}

export interface IslamicCardVisibilitySettings {
  showLogo: boolean;
  showNarrator: boolean;
  showSource: boolean;
  showFooter: boolean;
}

export interface IslamicCardFontStyles {
  narrator: FontStyles;
  hadisText: FontStyles;
  source: FontStyles;
  footer: FontStyles;
}

export interface BaseUrlCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  adBannerImage?: string | null;
  adBannerZoom?: number;
  adBannerPosition?: { x: number; y: number };
  fontStyles?: CardFontStyles;
  visibilitySettings?: VisibilitySettings;
  footerItems?: FooterItem[];
  footerOpacity?: number;
  footerIconColor?: "white" | "colored";
  watermark?: WatermarkSettings;
  isLogoFavicon?: boolean;
  elementLayout?: any;
  onLayoutChange?: (layout: any) => void;
  onVisibilityChange?: (settings: any) => void;
  onLogoUpload?: (file: File) => void;
  onFaviconUpload?: (file: File) => void;
  onRestoreDefaults?: () => void;
}

