/**
 * Cloudflare integration utilities for the SoZayn platform
 */

export interface OptimizedImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

/**
 * Generates an optimized image URL using Cloudflare's image resizing service
 * 
 * @param originalUrl The original image URL
 * @param options Options for image optimization
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: OptimizedImageOptions = {}
): string {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  try {
    // In production, this would point to a Cloudflare Worker
    // For now, we'll use our server-side proxy
    const apiUrl = '/api/cloudflare/image';
    const url = new URL(apiUrl, window.location.origin);
    
    // Add parameters
    url.searchParams.append('url', originalUrl);
    if (width) url.searchParams.append('width', width.toString());
    if (height) url.searchParams.append('height', height.toString());
    url.searchParams.append('quality', quality.toString());
    url.searchParams.append('format', format);
    
    return url.toString();
  } catch (error) {
    console.error('Error generating optimized image URL:', error);
    return originalUrl; // Fallback to original URL
  }
}

/**
 * Image component props for the optimized image component
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Get the user's country based on Cloudflare headers
 * This can be used for localization and content targeting
 */
export function getUserCountry(): Promise<string> {
  return fetch('/api/cloudflare/geo')
    .then(res => res.json())
    .then(data => data.country)
    .catch(error => {
      console.error('Error getting user country:', error);
      return 'US'; // Default to US
    });
}

/**
 * Check if the user is in a supported delivery area
 * 
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param restaurantId ID of the restaurant to check delivery for
 * @returns Promise resolving to a boolean indicating if delivery is available
 */
export async function isInDeliveryArea(
  latitude: number,
  longitude: number,
  restaurantId: number
): Promise<boolean> {
  try {
    const response = await fetch(`/api/cloudflare/delivery-check?lat=${latitude}&lng=${longitude}&restaurantId=${restaurantId}`);
    const data = await response.json();
    return data.isInDeliveryArea;
  } catch (error) {
    console.error('Error checking delivery area:', error);
    return false;
  }
}

/**
 * Get geolocation-aware content
 * This fetches content that is customized based on the user's location
 * 
 * @param contentKey Key for the content to fetch
 * @returns Promise resolving to the geo-aware content
 */
export async function getGeoContent(contentKey: string): Promise<any> {
  try {
    const response = await fetch(`/api/cloudflare/content/${contentKey}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching geo content for key ${contentKey}:`, error);
    throw error;
  }
}