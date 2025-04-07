import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/cloudflare';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

/**
 * OptimizedImage - A component for displaying images optimized through Cloudflare
 * 
 * This component automatically optimizes images using the Cloudflare Workers
 * image resizing service, supporting WebP, responsive sizing, and lazy loading.
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = 'webp',
  className = '',
  style = {},
  loading = 'lazy'
}: OptimizedImageProps) {
  const [optimizedUrl, setOptimizedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = getOptimizedImageUrl(src, { width, height, quality, format });
      setOptimizedUrl(url);
      setIsLoading(false);
    } catch (err) {
      console.error('Error optimizing image:', err);
      setError('Failed to optimize image');
      setOptimizedUrl(src); // Fallback to original source
      setIsLoading(false);
    }
  }, [src, width, height, quality, format]);

  if (error) {
    console.warn(`Image optimization error for ${src}: ${error}`);
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`bg-bg-card animate-pulse ${className}`} 
          style={{ 
            width: width ? `${width}px` : '100%', 
            height: height ? `${height}px` : '200px',
            ...style 
          }}
        />
      )}
      
      <img
        src={optimizedUrl || src}
        alt={alt}
        width={width}
        height={height}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        style={style}
        loading={loading}
        onError={() => {
          setError('Failed to load optimized image');
          setOptimizedUrl(src); // Fallback to original source
        }}
      />
    </>
  );
}

/**
 * ResponsiveImage - A component for displaying responsive images
 * 
 * This component automatically selects the appropriate image size based on
 * the viewport width, using Cloudflare's image optimization service.
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = [320, 640, 960, 1280, 1920],
  defaultSize = 640,
  className = '',
  style = {}
}: {
  src: string;
  alt: string;
  sizes?: number[];
  defaultSize?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [srcSet, setSrcSet] = useState<string>('');

  useEffect(() => {
    try {
      // Generate srcset attribute with multiple image sizes
      const srcSetString = sizes
        .map(size => {
          const url = getOptimizedImageUrl(src, { width: size, format: 'webp' });
          return `${url} ${size}w`;
        })
        .join(', ');
      
      setSrcSet(srcSetString);
    } catch (err) {
      console.error('Error generating responsive image srcset:', err);
    }
  }, [src, sizes]);

  return (
    <img
      src={getOptimizedImageUrl(src, { width: defaultSize, format: 'webp' })}
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      alt={alt}
      loading="lazy"
      className={`w-full ${className}`}
      style={style}
    />
  );
}