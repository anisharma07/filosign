const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: '../../../filosign-app/',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../../filosign-app/src/$1',
  },
  testMatch: [
    '<rootDir>/**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    '../../../filosign-app/src/**/*.{ts,tsx}',
    '!../../../filosign-app/src/**/*.d.ts',
    '!../../../filosign-app/src/app/globals.css',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);