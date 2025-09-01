import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// ⬇️ provider esistenti nel tuo progetto
import { UserProvider } from "./contexts/UserContext";
import { DataProvider } from "./state/DataContext";

// ⬇️ nuovo provider (RAM per seed sbloccate)
import { SecretsProvider } from "./contexts/SecretsContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SecretsProvider>
      <UserProvider>
        <DataProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DataProvider>
      </UserProvider>
    </SecretsProvider>
  </React.StrictMode>
);
