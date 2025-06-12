// src/main.tsx
// Fix for sockjs-client global variable issue
if (typeof (globalThis as any).global === "undefined") {
  (globalThis as any).global = globalThis;
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TokenManager } from "@/lib/token-manager";

// Initialize tokens from cookies
TokenManager.initializeFromCookies();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <App />
      <Toaster position="top-right" expand={false} richColors closeButton />
    </ThemeProvider>
  </React.StrictMode>
);
