import type {Config} from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/.*\\.spec\\.ts$" // Playwright用specファイルをJestから除外
  ],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./jest.setup.ts"],
};

export default createJestConfig(config);
