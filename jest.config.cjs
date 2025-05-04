/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testRunner: 'jest-circus/runner',
  collectCoverageFrom: ['src/**/*.{js,ts,jsx,tsx}'],
  coverageReporters: ['text', 'lcov', 'json'],
  coveragePathIgnorePatterns: ['node_modules', 'dist', 'build', 'public', 'src/main.tsx', 'src/App.tsx', 'src/vite-env.d.ts']
};