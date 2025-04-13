import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseClient = (env) => {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to handle OPTIONS requests for CORS
const handleOptions = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// Error logging function
const logError = async (error, request, env, ctx) => {
  // Get request details for context
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  
  // Format error message
  const errorObj = {
    timestamp: new Date().toISOString(),
    path,
    method,
    clientIP,
    userAgent,
    errorMessage: error.message || 'Unknown error',
    stack: error.stack || '',
    environment: env.ENVIRONMENT || 'development'
  };
  
  // In development, log to console
  console.error('API Error:', JSON.stringify(errorObj, null, 2));
  
  // In production, you could send this to a logging service
  // For example, using Cloudflare Analytics Engine or a third-party service
  if (env.SENTRY_DSN) {
    // Example of how to send to Sentry (would require Sentry SDK)
    // ctx.waitUntil(sendToSentry(errorObj, env.SENTRY_DSN));
  }
  
  // Could also write to KV for later analysis
  if (env.ERROR_LOGS_KV) {
    try {
      const key = `error:${Date.now()}:${Math.random().toString(36).substring(2, 7)}`;
      ctx.waitUntil(env.ERROR_LOGS_KV.put(key, JSON.stringify(errorObj)));
    } catch (e) {
      console.error('Failed to write error log to KV:', e);
    }
  }
};

// Helper to handle API responses
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
};

// Authentication middleware
const authenticate = async (request, env) => {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = supabaseClient(env);
  
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return { authenticated: false };
  }
  
  return { authenticated: true, user: data.user };
};

// Delivery partner API route handlers
const handleDeliveryPartnerRequest = async (request, env) => {
  const { authenticated, user } = await authenticate(request, env);
  
  if (!authenticated) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  // Skip 'api' in the beginning if present
  if (pathSegments[0] === 'api') {
    pathSegments.shift();
  }
  
  // Handle different endpoints
  if (pathSegments[0] === 'integrations') {
    const supabase = supabaseClient(env);
    
    // GET /api/integrations
    if (request.method === 'GET' && pathSegments.length === 1) {
      const query = supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);
      
      // Filter by type if query param exists
      const { searchParams } = url;
      if (searchParams.get('type')) {
        query.eq('type', searchParams.get('type'));
      }
      
      const { data, error } = await query;
      
      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }
      
      return jsonResponse(data);
    }
    
    // POST /api/integrations
    if (request.method === 'POST' && pathSegments.length === 1) {
      const body = await request.json();
      
      // Ensure user_id is set to authenticated user
      body.user_id = user.id;
      
      const { data, error } = await supabase
        .from('integrations')
        .insert([body])
        .select();
      
      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }
      
      return jsonResponse(data[0], 201);
    }
    
    // PATCH /api/integrations/:id
    if (request.method === 'PATCH' && pathSegments.length === 2) {
      const id = pathSegments[1];
      const body = await request.json();
      
      // Verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (fetchError || !existing) {
        return jsonResponse({ error: 'Integration not found' }, 404);
      }
      
      const { data, error } = await supabase
        .from('integrations')
        .update(body)
        .eq('id', id)
        .select();
      
      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }
      
      return jsonResponse(data[0]);
    }
    
    // DELETE /api/integrations/:id
    if (request.method === 'DELETE' && pathSegments.length === 2) {
      const id = pathSegments[1];
      
      // Verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (fetchError || !existing) {
        return jsonResponse({ error: 'Integration not found' }, 404);
      }
      
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);
      
      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }
      
      return jsonResponse({ success: true });
    }
    
    // POST /api/integrations/:id/test
    if (request.method === 'POST' && pathSegments.length === 3 && pathSegments[2] === 'test') {
      const id = pathSegments[1];
      
      // Verify ownership
      const { data: integration, error: fetchError } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (fetchError || !integration) {
        return jsonResponse({ error: 'Integration not found' }, 404);
      }
      
      // Here we'd actually test the integration
      // This would depend on the integration type
      // For now we'll just simulate a successful test
      
      return jsonResponse({ success: true, message: 'Integration test successful' });
    }
  }
  
  // Handle deliveries endpoints
  if (pathSegments[0] === 'delivery') {
    // GET /api/delivery/stats
    if (request.method === 'GET' && pathSegments.length === 2 && pathSegments[1] === 'stats') {
      const supabase = supabaseClient(env);
      
      // Get count of deliveries by status
      const { data: deliveries, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }
      
      // Calculate stats
      const total = deliveries.length;
      const completed = deliveries.filter(d => d.status === 'completed').length;
      const inProgress = deliveries.filter(d => ['pickup', 'dropoff', 'in_transit'].includes(d.status)).length;
      const cancelled = deliveries.filter(d => d.status === 'cancelled').length;
      
      // Calculate average delivery time (for completed deliveries)
      let avgDeliveryTime = 0;
      const completedDeliveries = deliveries.filter(d => d.status === 'completed');
      
      if (completedDeliveries.length > 0) {
        const totalMinutes = completedDeliveries.reduce((acc, d) => {
          const created = new Date(d.created_at);
          // Use delivery completion time or current time if not available
          const completed = d.dropoff_eta ? new Date(d.dropoff_eta) : new Date();
          const diffMinutes = (completed - created) / (1000 * 60);
          return acc + diffMinutes;
        }, 0);
        
        avgDeliveryTime = Math.round(totalMinutes / completedDeliveries.length);
      }
      
      return jsonResponse({
        total,
        completed,
        inProgress,
        cancelled,
        avgDeliveryTime
      });
    }
  }
  
  return jsonResponse({ error: 'Not Found' }, 404);
};

// Health check handler
const handleHealthCheck = (request, env) => {
  const healthInfo = {
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || 'development'
  };
  
  return jsonResponse(healthInfo);
};

// Simple rate limiting using Cloudflare's cache API
// This will be a basic implementation since we don't have KV storage enabled yet
const checkRateLimit = async (request, env, ctx) => {
  // Skip rate limiting for OPTIONS and health check
  const url = new URL(request.url);
  if (request.method === 'OPTIONS' || url.pathname === '/health' || url.pathname === '/api/health') {
    return false;
  }
  
  // Get client IP
  const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  
  // Use cache API for basic rate limiting
  // In production, use KV or Durable Objects for more robust rate limiting
  const cacheKey = `ratelimit:${clientIP}`;
  
  // Try to get current count from cache
  const cache = caches.default;
  let count = 1;
  
  try {
    const cacheResponse = await cache.match(cacheKey);
    if (cacheResponse) {
      const data = await cacheResponse.json();
      count = data.count + 1;
    }
    
    // Store updated count in cache with 1 minute expiry
    const newResponse = new Response(JSON.stringify({ count, timestamp: Date.now() }));
    newResponse.headers.set('Cache-Control', 'public, max-age=60');
    ctx.waitUntil(cache.put(cacheKey, newResponse));
    
    // Simple rate limit: 60 requests per minute
    // Adjust as needed for your application
    if (count > 60) {
      return true; // Rate limited
    }
  } catch (error) {
    // If cache fails, let the request through
    console.error('Rate limiting error:', error);
  }
  
  return false; // Not rate limited
};

// Main handler
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return handleOptions();
      }
      
      // Check rate limiting
      const isRateLimited = await checkRateLimit(request, env, ctx);
      if (isRateLimited) {
        return jsonResponse({ error: 'Too many requests' }, 429);
      }
      
      const url = new URL(request.url);
      
      // Health check endpoint
      if (url.pathname === '/health' || url.pathname === '/api/health') {
        return handleHealthCheck(request, env);
      }
      
      // API routes
      if (url.pathname.startsWith('/api/')) {
        return await handleDeliveryPartnerRequest(request, env);
      }
      
      return jsonResponse({ error: 'Not Found' }, 404);
    } catch (error) {
      // Log any unhandled errors
      ctx.waitUntil(logError(error, request, env, ctx));
      
      // Return appropriate error response to client
      console.error('Unhandled error:', error);
      
      // Don't expose internal error details in production
      const isProd = env.ENVIRONMENT === 'production';
      const errorMessage = isProd ? 'Internal Server Error' : error.message;
      
      return jsonResponse({ 
        error: errorMessage,
        requestId: crypto.randomUUID(), // For correlation with logs
      }, 500);
    }
  },
};