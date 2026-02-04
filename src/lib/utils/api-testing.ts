/**
 * API Testing Utilities
 *
 * Helper functions for testing admin API endpoints during development.
 * Useful for frontend-backend integration testing.
 *
 * Usage in browser console or test files:
 * import { testAdminEndpoints, mockApiResponse } from '@/lib/utils/api-testing';
 */

import { apiClient } from '@/lib/api/client';

// ============================================================================
// TYPES
// ============================================================================

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  statusCode?: number;
  data?: any;
  error?: string;
  duration: number;
}

interface EndpointTest {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: any;
  expectedStatus?: number;
}

// ============================================================================
// TEST RUNNERS
// ============================================================================

/**
 * Test a single admin API endpoint
 *
 * @param test - Endpoint test configuration
 * @returns Test result
 */
export async function testEndpoint(test: EndpointTest): Promise<TestResult> {
  const startTime = performance.now();

  try {
    let response: unknown;

    switch (test.method) {
      case 'GET':
        response = await apiClient.get(test.endpoint);
        break;
      case 'POST':
        response = await apiClient.post(test.endpoint, test.data);
        break;
      case 'PUT':
        response = await apiClient.put(test.endpoint, test.data);
        break;
      case 'PATCH':
        response = await apiClient.patch(test.endpoint, test.data);
        break;
      case 'DELETE':
        response = await apiClient.delete(test.endpoint);
        break;
    }

    const duration = performance.now() - startTime;

    // apiClient methods return data directly (not axios response object)
    // So if we got here, the request was successful (200-299 status)
    return {
      endpoint: test.endpoint,
      method: test.method,
      status: 'success',
      statusCode: 200, // Success - exact code not available from apiClient
      data: response,
      duration,
    };
  } catch (error: any) {
    const duration = performance.now() - startTime;

    return {
      endpoint: test.endpoint,
      method: test.method,
      status: 'error',
      statusCode: error.response?.status,
      error: error.message,
      duration,
    };
  }
}

/**
 * Test multiple admin endpoints in sequence
 *
 * @param tests - Array of endpoint tests
 * @returns Array of test results
 */
export async function testAdminEndpoints(
  tests: EndpointTest[]
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  console.log(`🧪 Testing ${tests.length} admin endpoints...`);

  for (const test of tests) {
    console.log(`\n📡 Testing: ${test.method} ${test.endpoint}`);
    const result = await testEndpoint(test);

    if (result.status === 'success') {
      console.log(`✅ Success (${result.statusCode}) - ${result.duration.toFixed(2)}ms`);
    } else {
      console.log(`❌ Error (${result.statusCode}) - ${result.error}`);
    }

    results.push(result);
  }

  console.log(`\n📊 Test Summary:`);
  const successCount = results.filter((r) => r.status === 'success').length;
  console.log(`✅ Passed: ${successCount}/${tests.length}`);
  console.log(`❌ Failed: ${tests.length - successCount}/${tests.length}`);

  return results;
}

// ============================================================================
// PREDEFINED TEST SUITES
// ============================================================================

/**
 * Test suite for Roles & Permissions APIs
 */
export const rolesTestSuite: EndpointTest[] = [
  {
    name: 'List all roles',
    method: 'GET',
    endpoint: '/admin/roles',
    expectedStatus: 200,
  },
  {
    name: 'Get role statistics',
    method: 'GET',
    endpoint: '/admin/roles/statistics',
    expectedStatus: 200,
  },
  {
    name: 'List all permissions',
    method: 'GET',
    endpoint: '/admin/permissions',
    expectedStatus: 200,
  },
  {
    name: 'List grouped permissions',
    method: 'GET',
    endpoint: '/admin/permissions?grouped=true',
    expectedStatus: 200,
  },
];

/**
 * Test suite for KYC APIs
 */
export const kycTestSuite: EndpointTest[] = [
  {
    name: 'List all KYC documents',
    method: 'GET',
    endpoint: '/admin/kyc',
    expectedStatus: 200,
  },
  {
    name: 'Get pending KYC',
    method: 'GET',
    endpoint: '/admin/kyc/pending',
    expectedStatus: 200,
  },
  {
    name: 'Get KYC statistics',
    method: 'GET',
    endpoint: '/admin/kyc/statistics',
    expectedStatus: 200,
  },
  {
    name: 'List KYC with filters',
    method: 'GET',
    endpoint: '/admin/kyc?status=pending&per_page=10',
    expectedStatus: 200,
  },
];

/**
 * Test suite for all missing APIs
 */
export const missingApisTestSuite: EndpointTest[] = [
  ...rolesTestSuite,
  ...kycTestSuite,
  {
    name: 'Export KYC documents',
    method: 'GET',
    endpoint: '/admin/kyc/export?format=csv',
    expectedStatus: 200,
  },
  {
    name: 'Export revenue report',
    method: 'GET',
    endpoint: '/admin/reports/revenue/export?format=pdf&period=month',
    expectedStatus: 200,
  },
];

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock API response for development
 *
 * @param type - Type of mock data to generate
 * @param count - Number of items to generate
 * @returns Mock API response
 */
export function mockApiResponse(
  type: 'role' | 'permission' | 'kyc' | 'user',
  count: number = 5
): any {
  const generators: Record<string, () => any> = {
    role: () => ({
      id: Math.floor(Math.random() * 1000),
      name: `Role ${Math.random().toString(36).substring(7)}`,
      guard_name: 'api',
      permissions: ['view_users', 'manage_users'],
      users_count: Math.floor(Math.random() * 100),
      created_at: new Date().toISOString(),
    }),

    permission: () => ({
      id: Math.floor(Math.random() * 1000),
      name: `permission_${Math.random().toString(36).substring(7)}`,
      guard_name: 'api',
    }),

    kyc: () => ({
      id: Math.random().toString(36).substring(7),
      organization_id: Math.random().toString(36).substring(7),
      document_type: 'business_registration',
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      is_verified: Math.random() > 0.5,
      is_expired: Math.random() > 0.8,
      created_at: new Date().toISOString(),
      organization: {
        id: Math.random().toString(36).substring(7),
        name: `Company ${Math.random().toString(36).substring(7)}`,
        type: 'corporate',
      },
    }),

    user: () => ({
      id: Math.random().toString(36).substring(7),
      full_name: `User ${Math.random().toString(36).substring(7)}`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      roles: ['Platform Admin'],
      created_at: new Date().toISOString(),
    }),
  };

  const items = Array.from({ length: count }, () => generators[type]());

  return {
    success: true,
    message: `${type}s retrieved successfully.`,
    data: items,
    meta: {
      current_page: 1,
      total: count,
      per_page: 20,
      last_page: Math.ceil(count / 20),
    },
  };
}

// ============================================================================
// BROWSER CONSOLE HELPERS
// ============================================================================

/**
 * Check if all admin APIs are responding
 * Run this in browser console: checkAdminAPIs()
 */
export async function checkAdminAPIs(): Promise<void> {
  console.log('🔍 Checking Admin API Health...\n');

  const endpoints = [
    { name: 'Users', url: '/admin/users' },
    { name: 'Organizations', url: '/admin/organizations' },
    { name: 'Transactions', url: '/admin/transactions' },
    { name: 'KYC Pending', url: '/admin/kyc/pending' },
    { name: 'Roles', url: '/admin/roles' },
    { name: 'Permissions', url: '/admin/permissions' },
    { name: 'Statistics', url: '/admin/statistics' },
    { name: 'Logs', url: '/admin/logs' },
  ];

  const results = await Promise.all(
    endpoints.map(async ({ name, url }) => {
      try {
        await apiClient.get(url);
        // apiClient returns data directly, so if we got here, it was successful
        return { name, status: 200, ok: true };
      } catch (error: any) {
        return {
          name,
          status: error.response?.status || 0,
          ok: false,
          error: error.message,
        };
      }
    })
  );

  console.table(results);

  const allOk = results.every((r) => r.ok);
  if (allOk) {
    console.log('\n✅ All admin APIs are responding correctly!');
  } else {
    console.log('\n⚠️ Some APIs are not responding. Check the table above.');
  }
}

/**
 * Make global for browser console access
 */
if (typeof window !== 'undefined') {
  (window as any).testAdminEndpoints = testAdminEndpoints;
  (window as any).checkAdminAPIs = checkAdminAPIs;
  (window as any).mockApiResponse = mockApiResponse;
  (window as any).rolesTestSuite = rolesTestSuite;
  (window as any).kycTestSuite = kycTestSuite;
  (window as any).missingApisTestSuite = missingApisTestSuite;

  console.log('🧪 API Testing utilities loaded!');
  console.log('Available commands:');
  console.log('  - checkAdminAPIs() - Check all admin APIs health');
  console.log('  - testAdminEndpoints(rolesTestSuite) - Test roles APIs');
  console.log('  - testAdminEndpoints(kycTestSuite) - Test KYC APIs');
  console.log('  - testAdminEndpoints(missingApisTestSuite) - Test all missing APIs');
  console.log('  - mockApiResponse("role", 10) - Generate mock data');
}

// ============================================================================
// EXPORT
// ============================================================================

export const apiTestingUtils = {
  testEndpoint,
  testAdminEndpoints,
  mockApiResponse,
  checkAdminAPIs,
  rolesTestSuite,
  kycTestSuite,
  missingApisTestSuite,
};

export default apiTestingUtils;
