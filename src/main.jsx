import React from "react";
import ReactDOM from "react-dom/client";
import {ChakraProvider} from "@chakra-ui/react";
import {extendTheme} from "@chakra-ui/theme-utils";
import { App } from "./App"; // if you saved that code in App.jsx

const theme = extendTheme({
  color: {
    brand: {
      100: "#f7fafc",
        // ...
      900: "#1a202c",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
