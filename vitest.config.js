import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 20000,
    env: {
      NODE_ENV: "test",
      DISABLE_REMOTE_PROXY: "true",
      JWT_SECRET: "test_secret_for_automated_testing_purposes_only",
      PORT: "0",
    },
  },
});
