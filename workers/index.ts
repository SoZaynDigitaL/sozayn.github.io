/**
 * SoZayn Edge Worker
 * 
 * This Cloudflare Worker handles edge computing tasks for the SoZayn platform, including:
 * - Image optimization for restaurant/grocery product images
 * - API request caching and acceleration
 * - Security headers and protection
 * - Geographic content adaptation
 */

export interface Env {
  // KV Namespace binding
  SOZAYN_CACHE: KVNamespace;
  // Environment variables
  ENVIRONMENT: string;
}

// Helper to set security headers for all responses
function setSecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  
  // Set security headers
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('X-XSS-Protection', '1; mode=block');
  
  // Return a new response with the updated headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// Image optimization handler
async function handleImageRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const imagePath = url.pathname;
  
  // Check if the image is in our KV cache
  const cachedImage = await env.SOZAYN_CACHE.get(imagePath, 'arrayBuffer');
  
  if (cachedImage) {
    // Return the cached image
    return new Response(cachedImage, {
      headers: {
        'Content-Type': 'image/webp', // Assuming WebP format for optimized images
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
  
  // Image not in cache, fetch from origin
  // In a real implementation, you would fetch the original image,
  // optimize it (resize, compress, convert to WebP), and store in KV
  
  // Pass through to origin for now
  return fetch(request);
}

// API caching handler
async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const cacheKey = `api:${url.pathname}${url.search}`;
  
  // Only cache GET requests
  if (request.method === 'GET') {
    // Check if the API response is cached
    const cachedResponse = await env.SOZAYN_CACHE.get(cacheKey);
    
    if (cachedResponse) {
      return new Response(cachedResponse, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'HIT',
        },
      });
    }
    
    // Not in cache, fetch from origin
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok) {
      const responseText = await response.clone().text();
      
      // Store in KV cache with 60-second expiration
      await env.SOZAYN_CACHE.put(cacheKey, responseText, { expirationTtl: 60 });
      
      // Return the response with cache header
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Cache', 'MISS');
      
      return new Response(responseText, {
        status: response.status,
        headers: newHeaders,
      });
    }
    
    return response;
  }
  
  // Non-GET requests bypass cache
  return fetch(request);
}

// Main worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    try {
      let response: Response;
      
      // Route based on request path
      if (url.pathname.startsWith('/api/')) {
        // Handle API requests
        response = await handleApiRequest(request, env);
      } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // Handle image requests
        response = await handleImageRequest(request, env);
      } else {
        // Pass through all other requests
        response = await fetch(request);
      }
      
      // Add security headers to all responses
      return setSecurityHeaders(response);
    } catch (e) {
      // Handle errors
      console.error('Worker error:', e);
      
      return new Response('An error occurred', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};