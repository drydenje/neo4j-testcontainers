// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
    "!src/types/**/*.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  testTimeout: 60000,
  maxWorkers: 1,
  verbose: true,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
