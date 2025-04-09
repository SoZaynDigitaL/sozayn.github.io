import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type ApiRequestOptions = {
  on401: "returnNull" | "throw";
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: Partial<ApiRequestOptions>
): Promise<Response> {
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Always include credentials (cookies) with requests
    mode: "cors", // Allow CORS
    cache: "no-cache" // Don't cache requests
  });

  // Skip error throwing for 401 errors if specified in options
  if (options?.on401 === "returnNull" && res.status === 401) {
    return res;
  }

  if (!options || options.on401 === "throw") {
    await throwIfResNotOk(res);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: "include", // Always include credentials (cookies) with requests
      mode: "cors", // Allow CORS
      cache: "no-cache" // Don't cache requests
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
