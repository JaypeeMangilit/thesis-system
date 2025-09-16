import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          100: { value: "#E3F2FD" },
          500: { value: "#2196F3" },
          700: { value: "#1565C0" },
        },
        sidebar: {
          100: { value: "#6a11cb" },
          200: { value: "#2575fc" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
