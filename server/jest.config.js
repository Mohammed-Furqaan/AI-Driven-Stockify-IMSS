export default {
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "models/**/*.js",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleFileExtensions: ["js", "json", "node"],
  testPathIgnorePatterns: ["/node_modules/"],
};
