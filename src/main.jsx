import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { UserDataProvider } from "./context/UserDataContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserDataProvider>
      <App />
    </UserDataProvider>
  </React.StrictMode>
);

// Optional: register service worker if present
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("Service Worker registered."))
      .catch(() => {});
  });
}
