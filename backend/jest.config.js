/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleNameMapper: { '@/(.*)': '<rootDir>/src/$1' },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  },
  setupFilesAfterEnv: [],
  testTimeout: 30000,
};
