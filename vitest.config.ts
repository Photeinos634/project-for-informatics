import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  test: {
    environment: "node",
    include: [
      "tests/encoding/encodingInitializer.test.ts",
      "tests/encoding/encodingMetadata.test.ts",
      "tests/encoding/encodingResolver.test.ts",
      "tests/encoding/engines/**/*.test.ts",
      "tests/unicode/**/*.test.ts",
    ],
  },
});
