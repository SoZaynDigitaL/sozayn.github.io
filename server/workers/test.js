// Test script for Cloudflare Worker
import worker from './index.js';

// Mock environment variables
const mockEnv = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key',
};

// Mock request function
async function mockFetch(path, options = {}) {
  const url = new URL(`https://api.sozayn.com${path}`);
  const request = new Request(url, options);
  return worker.fetch(request, mockEnv);
}

// Run tests
async function runTests() {
  console.log('Testing Cloudflare Worker API...');

  try {
    // Test health endpoint
    const healthResponse = await mockFetch('/api/health');
    console.log('Health check:', healthResponse.status, await healthResponse.text());

    // Test unauthorized access
    const unauthorizedResponse = await mockFetch('/api/integrations');
    console.log('Unauthorized access:', unauthorizedResponse.status);

    // More tests can be added here as needed

    console.log('Tests completed.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Only run tests directly if this file is executed directly
if (require.main === module) {
  runTests();
}

export { mockFetch, runTests };