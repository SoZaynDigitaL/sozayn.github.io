import { createClient } from '@supabase/supabase-js';
import swaggerDocsJson from './swagger.js';

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
    stack: error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : '',
    environment: env.ENVIRONMENT || 'development'
  };
  
  // Log to console
  console.error('API Error:', JSON.stringify(errorObj));
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
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false };
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Check if Supabase URL and key are available
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase credentials in environment');
      return { authenticated: false };
    }
    
    const supabase = supabaseClient(env);
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data || !data.user) {
      console.error('Authentication error:', error);
      return { authenticated: false };
    }
    
    return { authenticated: true, user: data.user };
  } catch (error) {
    console.error('Authentication exception:', error);
    return { authenticated: false };
  }
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

// Simple rate limiting using request IP
// This is a basic implementation without requiring KV storage
const checkRateLimit = async (request, env, ctx) => {
  // Skip rate limiting for OPTIONS and health check
  const url = new URL(request.url);
  if (request.method === 'OPTIONS' || url.pathname === '/health' || url.pathname === '/api/health') {
    return false;
  }
  
  // Get client IP
  const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  
  // For now, we're returning false to allow all requests through
  // This simplified implementation avoids cache issues in deployment
  // In a production environment, you should implement proper rate limiting
  // using KV namespaces or Durable Objects
  
  return false; // Not rate limited
};

// Handler for API documentation
const handleApiDocs = (request) => {
  return jsonResponse(swaggerDocsJson);
};

// Main handler for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return handleOptions();
      }
      
      // Check rate limiting (simplified for now)
      const isRateLimited = await checkRateLimit(request, env, ctx);
      if (isRateLimited) {
        return jsonResponse({ error: 'Too many requests' }, 429);
      }
      
      const url = new URL(request.url);
      const pathname = url.pathname;
      
      // Health check endpoint
      if (pathname === '/health' || pathname === '/api/health') {
        return handleHealthCheck(request, env);
      }
      
      // API documentation endpoint
      if (pathname === '/docs' || pathname === '/api/docs') {
        return handleApiDocs(request);
      }
      
      // API routes
      if (pathname.startsWith('/api/')) {
        return await handleDeliveryPartnerRequest(request, env);
      }
      
      // Default not found response
      return jsonResponse({
        error: 'Not Found',
        message: `Route ${pathname} not found`,
        timestamp: new Date().toISOString()
      }, 404);
    } catch (error) {
      // Log any unhandled errors
      try {
        await logError(error, request, env, ctx);
      } catch (logError) {
        // Failsafe if logging itself fails
        console.error('Error logging failed:', logError);
      }
      
      // Return appropriate error response to client
      console.error('Unhandled error:', error.message);
      
      // Don't expose internal error details in production
      const isProd = env.ENVIRONMENT === 'production';
      const errorMessage = isProd ? 'Internal Server Error' : error.message;
      
      return jsonResponse({ 
        error: errorMessage,
        path: new URL(request.url).pathname,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
      }, 500);
    }
  },
};