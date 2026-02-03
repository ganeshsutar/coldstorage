import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import { App } from "@/app/app";
import { initializeTheme } from "@/hooks/use-theme";

// Initialize theme before React mounts to prevent flash
initializeTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
