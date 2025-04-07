/**
 * SoZayn Geo-Router Worker
 * 
 * This worker provides geolocation-aware routing for the SoZayn platform.
 * - Detects user location from Cloudflare headers
 * - Routes users to closest restaurant/grocery partners
 * - Delivers location-specific content and promotions
 * - Adjusts delivery radius and options based on location
 */

export interface Env {
  SOZAYN_CACHE: KVNamespace;
  ENVIRONMENT: string;
}

interface GeoData {
  country: string;
  region: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

// Extract geolocation data from Cloudflare request headers
function extractGeoData(request: Request): GeoData {
  return {
    country: request.headers.get('CF-IPCountry') || 'US',
    region: request.headers.get('CF-Region') || '',
    city: request.headers.get('CF-City') || '',
    postalCode: request.headers.get('CF-Postal-Code') || '',
    latitude: parseFloat(request.headers.get('CF-Latitude') || '0'),
    longitude: parseFloat(request.headers.get('CF-Longitude') || '0'),
  };
}

// Calculate distance between two geo points (Haversine formula)
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Add geo headers to the request when proxying to origin
function addGeoHeaders(request: Request, geoData: GeoData): Request {
  const newHeaders = new Headers(request.headers);
  
  // Add SoZayn custom geo headers
  newHeaders.set('X-SoZayn-Geo-Country', geoData.country);
  newHeaders.set('X-SoZayn-Geo-Region', geoData.region);
  newHeaders.set('X-SoZayn-Geo-City', geoData.city);
  newHeaders.set('X-SoZayn-Geo-Postal', geoData.postalCode);
  newHeaders.set('X-SoZayn-Geo-Lat', geoData.latitude.toString());
  newHeaders.set('X-SoZayn-Geo-Lng', geoData.longitude.toString());
  
  // Create a new request with the updated headers
  return new Request(request.url, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: request.redirect,
  });
}

// Handle API requests that need geo information
async function handleGeoApiRequest(request: Request, env: Env, geoData: GeoData): Promise<Response> {
  const url = new URL(request.url);
  
  // Handle specific geo-aware API endpoints
  if (url.pathname === '/api/nearbyRestaurants' || url.pathname === '/api/nearbyGroceries') {
    // Construct cache key including geo data (rounded to ~10km precision)
    const lat = Math.round(geoData.latitude * 10) / 10;
    const lng = Math.round(geoData.longitude * 10) / 10;
    const cacheKey = `geo:${url.pathname}:${lat},${lng}`;
    
    // Check cache
    const cachedResponse = await env.SOZAYN_CACHE.get(cacheKey);
    if (cachedResponse) {
      return new Response(cachedResponse, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 minute cache
          'X-Cache': 'HIT',
        },
      });
    }
    
    // Forward request to origin with geo headers
    const geoRequest = addGeoHeaders(request, geoData);
    const response = await fetch(geoRequest);
    
    if (response.ok) {
      const responseText = await response.clone().text();
      
      // Cache the response
      ctx.waitUntil(
        env.SOZAYN_CACHE.put(cacheKey, responseText, { expirationTtl: 300 })
      );
      
      // Return with cache headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Cache', 'MISS');
      
      return new Response(responseText, {
        status: response.status,
        headers: newHeaders,
      });
    }
    
    return response;
  }
  
  // For other API requests, just add geo headers and proxy
  const geoRequest = addGeoHeaders(request, geoData);
  return fetch(geoRequest);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Extract geolocation data from request
    const geoData = extractGeoData(request);
    const url = new URL(request.url);
    
    try {
      // Handle API requests
      if (url.pathname.startsWith('/api/')) {
        return await handleGeoApiRequest(request, env, geoData);
      }
      
      // For regular page requests, just add the geo headers and proxy
      const geoRequest = addGeoHeaders(request, geoData);
      return fetch(geoRequest);
      
    } catch (e) {
      console.error('Geo-router error:', e);
      
      // Fall back to original request
      return fetch(request);
    }
  },
};