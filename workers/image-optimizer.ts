/**
 * SoZayn Image Optimizer Worker
 * 
 * This worker specifically handles image optimization for restaurant and grocery
 * product images, menus, and promotional materials.
 */

export interface Env {
  SOZAYN_CACHE: KVNamespace;
  ENVIRONMENT: string;
}

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

// Parse image options from URL parameters
function parseImageOptions(url: URL): ImageOptions {
  const options: ImageOptions = {
    format: 'webp', // Default to WebP for better compression
    quality: 80,    // Default quality
  };
  
  // Parse width
  if (url.searchParams.has('w')) {
    const width = parseInt(url.searchParams.get('w') || '0', 10);
    if (width > 0) {
      options.width = Math.min(width, 2000); // Cap at 2000px
    }
  }
  
  // Parse height
  if (url.searchParams.has('h')) {
    const height = parseInt(url.searchParams.get('h') || '0', 10);
    if (height > 0) {
      options.height = Math.min(height, 2000); // Cap at 2000px
    }
  }
  
  // Parse quality
  if (url.searchParams.has('q')) {
    const quality = parseInt(url.searchParams.get('q') || '0', 10);
    if (quality > 0) {
      options.quality = Math.min(Math.max(quality, 10), 100); // Between 10-100
    }
  }
  
  // Parse format
  if (url.searchParams.has('fm')) {
    const format = url.searchParams.get('fm');
    if (format === 'webp' || format === 'jpeg' || format === 'png' || format === 'avif') {
      options.format = format;
    }
  }
  
  return options;
}

// Generate cache key for the optimized image
function generateCacheKey(url: URL, options: ImageOptions): string {
  const originalPath = url.pathname;
  return `img:${originalPath}:w${options.width || 'auto'}:h${options.height || 'auto'}:q${options.quality}:${options.format}`;
}

// In a real implementation, this would use the Cloudflare Image Resizing API
// or another image processing library compatible with Workers
async function optimizeImage(imageData: ArrayBuffer, options: ImageOptions): Promise<ArrayBuffer> {
  // This is a placeholder - in a real implementation you would:
  // 1. Decode the image
  // 2. Resize it according to options
  // 3. Re-encode in the target format
  
  // For now, just return the original image data
  return imageData;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Only process image paths
    if (!url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return new Response('Not an image path', { status: 400 });
    }
    
    try {
      // Parse options from URL
      const options = parseImageOptions(url);
      
      // Generate cache key based on original URL and transformation options
      const cacheKey = generateCacheKey(url, options);
      
      // Check cache first
      const cachedImage = await env.SOZAYN_CACHE.get(cacheKey, 'arrayBuffer');
      
      if (cachedImage) {
        return new Response(cachedImage, {
          headers: {
            'Content-Type': `image/${options.format}`,
            'Cache-Control': 'public, max-age=86400',
            'X-Cache': 'HIT',
          },
        });
      }
      
      // Not in cache, fetch original image
      // Strip the transformation parameters to get original image URL
      const originalUrl = new URL(url.href);
      originalUrl.searchParams.delete('w');
      originalUrl.searchParams.delete('h');
      originalUrl.searchParams.delete('q');
      originalUrl.searchParams.delete('fm');
      
      const imageResponse = await fetch(originalUrl.toString());
      
      if (!imageResponse.ok) {
        return imageResponse;
      }
      
      // Get image data as array buffer
      const imageData = await imageResponse.arrayBuffer();
      
      // Optimize the image
      const optimizedImageData = await optimizeImage(imageData, options);
      
      // Store in cache
      ctx.waitUntil(
        env.SOZAYN_CACHE.put(cacheKey, optimizedImageData, { expirationTtl: 86400 })
      );
      
      // Return optimized image
      return new Response(optimizedImageData, {
        headers: {
          'Content-Type': `image/${options.format}`,
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'MISS',
        },
      });
      
    } catch (e) {
      console.error('Image optimization error:', e);
      
      // Fall back to original image
      return fetch(request);
    }
  },
};