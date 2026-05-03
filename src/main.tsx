import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/styles/globals.css";
import { attachDebugCheats } from "@/lib/debugCheats";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Attach debug cheats for browser console
attachDebugCheats();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
