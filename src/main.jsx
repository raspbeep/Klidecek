import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.jsx";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

requestAnimationFrame(() => {
  document.body.classList.remove("booting");
  document.body.classList.add("booted");
});
