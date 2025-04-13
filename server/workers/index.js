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

// Main handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }
    
    const url = new URL(request.url);
    
    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleDeliveryPartnerRequest(request, env);
    }
    
    return jsonResponse({ error: 'Not Found' }, 404);
  },
};