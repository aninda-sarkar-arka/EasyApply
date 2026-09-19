// Injected into every test worker before any test runs.
// Sets safe placeholder values so controllers don't 503/500 due to missing config.
// Never load real .env here — tests must not depend on real credentials.
process.env.JWT_SECRET = 'test-jwt-secret-for-tests-only';
process.env.GEMINI_API_KEY = 'test-key-not-used';
// MONGO_URI intentionally not set — tests use mongodb-memory-server
