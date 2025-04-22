module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    './jest-setup.ts',
  ],
  fakeTimers: {
    enableGlobally: true,
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  'moduleNameMapper': {
    '^@canvas-ui/assert(.*)$': '<rootDir>/packages/assert/src/$1'
  }
}
