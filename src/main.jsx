import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { system } from "./theme"; // your custom theme
import { Toaster } from "./components/ui/toaster";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      <BrowserRouter>
        <Toaster />
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);