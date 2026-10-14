import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onNeedRefresh() {
    // autoUpdate strategy (set in vite.config.js) handles the reload itself,
    // so nothing extra to do here. Optional: show a toast.
  },
  onOfflineReady() {
    console.log("Phonk Hub ready to work offline");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
