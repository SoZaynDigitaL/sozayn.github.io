import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type ApiRequestOptions = {
  on401: "returnNull" | "throw";
  headers?: Record<string, string>;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: Partial<ApiRequestOptions>
): Promise<Response> {
  // Check if we have an auth token in localStorage
  const TOKEN_KEY = 'sozayn_auth_token';
  const authToken = localStorage.getItem(TOKEN_KEY);
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options?.headers || {})
  };

  // Add auth token to headers if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`API Request: ${method} ${url}`, { 
    withCredentials: true,
    documentCookie: document.cookie ? 'present' : 'missing',
    hasAuthToken: !!authToken
  });

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Always include credentials (cookies) with requests
      mode: "same-origin", // Changed from "cors" to "same-origin" since we're on the same domain
      cache: "no-cache" // Don't cache requests
    });

    const cookies = document.cookie;
    console.log(`API Response: ${res.status} for ${method} ${url}`, { 
      hasCookies: cookies ? 'yes' : 'no',
      cookieCount: cookies.split(';').filter(c => c.trim()).length
    });

    // Skip error throwing for 401 errors if specified in options
    if (options?.on401 === "returnNull" && res.status === 401) {
      return res;
    }

    if (!options || options.on401 === "throw") {
      await throwIfResNotOk(res);
    }
    
    return res;
  } catch (error) {
    // Handle network errors or other fetch failures
    console.error(`API Request failed for ${method} ${url}:`, error);
    
    // Create a custom Response object for network errors
    const errorResponse = new Response(JSON.stringify({
      error: "Network error",
      message: error instanceof Error ? error.message : "Failed to connect to server"
    }), {
      status: 0,
      statusText: "Network Error",
      headers: new Headers({ 'Content-Type': 'application/json' })
    });
    
    if (!options || options.on401 === "throw") {
      throw error;
    }
    
    return errorResponse;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Check if we have an auth token in localStorage
    const TOKEN_KEY = 'sozayn_auth_token';
    const authToken = localStorage.getItem(TOKEN_KEY);
    
    console.log(`QueryFn: GET ${queryKey[0]}`, { 
      withCredentials: true,
      documentCookie: document.cookie ? 'present' : 'missing',
      hasAuthToken: !!authToken
    });
    
    // Create headers with token if available
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
      const res = await fetch(queryKey[0] as string, {
        method: 'GET',
        headers,
        credentials: "include", // Always include credentials (cookies) with requests
        mode: "same-origin", // Changed from "cors" to "same-origin" since we're on the same domain
        cache: "no-cache" // Don't cache requests
      });

      console.log(`QueryFn Response: ${res.status} for GET ${queryKey[0]}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // Parse as JSON and handle possible JSON parsing errors
      try {
        return await res.json();
      } catch (jsonError) {
        console.error(`Failed to parse JSON response from ${queryKey[0]}:`, jsonError);
        throw new Error(`Invalid JSON response from server: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`);
      }
    } catch (error) {
      console.error(`QueryFn failed for GET ${queryKey[0]}:`, error);
      
      if (unauthorizedBehavior === "returnNull" && error instanceof Error && error.message.includes('401')) {
        return null;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
