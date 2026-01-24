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
}

export interface BackgroundOptions {
  type: 'solid' | 'gradient';
  color: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface MultiplePhotocardData {
  id: string;
  data: PhotocardData;
  status: 'pending' | 'loading' | 'completed' | 'error';
  error?: string;
}