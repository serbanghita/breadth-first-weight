module.exports = {
    rootDir: ".",
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/**/*.d.ts",
        "!<rootDir>/src/**/*.test.ts",
        "!**/node_modules/**"
    ],
    coverageDirectory: ".tmp/coverage",
    coverageReporters: ["html", "json", "lcov", "text", "clover"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    transform: {
        "\\.ts$": "ts-jest",
    },
    testMatch: ["<rootDir>/src/**/*.test.ts"],
    verbose: true
};