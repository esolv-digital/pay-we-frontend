/**
 * Test Fixtures Index
 *
 * Central export for all test fixtures and utilities.
 */

// Authentication fixtures
export {
  test,
  expect,
  login,
  logout,
  isAuthenticated,
  navigateToAdmin,
  testUsers,
} from './auth';

// Test data fixtures
export {
  uniqueId,
  createTestUser,
  createTestOrganization,
  roleTestData,
  kycTestData,
  userTestData,
  organizationTestData,
  transactionTestData,
  reportTestData,
  mockResponses,
  wait,
  randomString,
  randomEmail,
  randomPhone,
  formatDate,
  getDateRange,
} from './test-data';
