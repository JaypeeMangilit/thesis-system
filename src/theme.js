import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          100: { value: "#f7fafc" },
          900: { value: "#1a202c" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
