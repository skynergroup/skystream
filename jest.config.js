import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: ['node_modules/(?!(lucide-react)/)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/utils/config.js',
    '!src/utils/analytics.js',
    '!src/components/index.js',
    '!src/pages/index.js',
    '!src/utils/index.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/'],
};

export default createJestConfig(customJestConfig);
