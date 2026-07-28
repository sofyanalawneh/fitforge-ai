import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { DesignModeProvider } from "./contexts/DesignModeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DesignModeProvider>
          <App />
        </DesignModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
