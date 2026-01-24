/**
 * Proxy external images through our API to avoid CORS issues
 */
export function getProxiedImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // If it's a relative URL or data URL, return as is
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Check if we're on the client side and if it's from the same origin
  if (typeof window !== 'undefined' && imageUrl.startsWith(window.location.origin)) {
    return imageUrl;
  }
  
  // For external URLs, proxy them through our API
  return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}

/**
 * Check if an image URL needs to be proxied
 */
export function needsProxy(imageUrl: string): boolean {
  if (!imageUrl) return false;
  
  // Don't proxy local URLs
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return false;
  }
  
  // Don't proxy if it's from the same origin (client-side only)
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(imageUrl);
      return url.origin !== window.location.origin;
    } catch (error) {
      return false;
    }
  }
  
  // On server side, assume external URLs need proxying
  return true;
}