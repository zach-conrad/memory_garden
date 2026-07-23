/**
* 
* Initializes and renders the MG application
*
* Serves as the application's entry point by loading global styles,
* creating the React root, and rending the top-level App component
* @packageDocumentation
*/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
