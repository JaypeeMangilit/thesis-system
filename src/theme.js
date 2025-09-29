import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#ffffffff" },
          100: { value: "#BBDEFB" },
          200: { value: "#90CAF9" },
          300: { value: "#64B5F6" },
          400: { value: "#42A5F5" },
          500: { value: "#2196F3" },
          600: { value: "#0077B6" }, // logo blue
          700: { value: "#0D47A1" },
          800: { value: "#1A1A2E" }, // deep navy
          900: { value: "#5A7FB4" }, // background color in student portal login form
        },
        accent: {
          500: { value: "#FF6B00" }, // torch flame
        },
        gray: {
          100: { value: "#F5F5F5" }, // book/hands
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
