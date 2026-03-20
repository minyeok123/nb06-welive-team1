/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@app-types/(.*)$': '<rootDir>/src/types/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '.*poll.*', '.*pollsvote.*'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/poll/**',
    '!src/**/pollsvote/**',
  ],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
};
