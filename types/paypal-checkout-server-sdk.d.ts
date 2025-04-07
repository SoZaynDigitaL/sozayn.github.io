declare module '@paypal/checkout-server-sdk' {
  interface PayPalOrderLink {
    href: string;
    rel: string;
    method?: string;
  }

  interface PayPalOrderResponse {
    id: string;
    status: string;
    links: PayPalOrderLink[];
  }

  interface PayPalCaptureResponse {
    id: string;
    status: string;
  }

  namespace core {
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    
    class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment);
      execute<T = PayPalOrderResponse | PayPalCaptureResponse>(request: any): Promise<{ result: T }>;
    }
  }
  
  namespace orders {
    class OrdersCreateRequest {
      prefer(preference: string): void;
      requestBody(body: any): void;
    }
    
    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: any): void;
    }
  }
}