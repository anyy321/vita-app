import "./storage-polyfill.js";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function showFatalError(err) {
  const root = document.getElementById("root");
  root.innerHTML =
    '<pre style="white-space:pre-wrap;padding:16px;font-size:12px;color:#3E2E28;background:#F4EEE2;min-height:100vh;margin:0;">' +
    "ERRO AO CARREGAR O APP:\n\n" +
    String((err && err.stack) || err) +
    "</pre>";
}

window.addEventListener("error", (e) => showFatalError(e.error || e.message));
window.addEventListener("unhandledrejection", (e) =>
  showFatalError(e.reason)
);

async function start() {
  try {
    const AuthGate = (await import("./AuthGate.jsx")).default;
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <AuthGate />
      </React.StrictMode>
    );
  } catch (err) {
    showFatalError(err);
  }
}

start();
