module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coverageReporters: [
        "json-summary",
        'lcov'
    ]
};
