// @skystream/api is pure ESM with no JSX, so jest runs the source natively
// via --experimental-vm-modules (see the package "test" script). No babel
// transform is needed — `transform: {}` keeps files untouched.
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/index.js', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
};
