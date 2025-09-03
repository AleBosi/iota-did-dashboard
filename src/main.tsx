import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { AppProvider } from "./contexts/AppContext";   // UI-only (tema, sidebar, flags)
import { UserProvider } from "./contexts/UserContext"; // sessione/ruolo/DID
import { DataProvider } from "./state/DataContext";    // dominio (actors, events, vc, crediti)

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <UserProvider>
        <DataProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DataProvider>
      </UserProvider>
    </AppProvider>
  </React.StrictMode>
);
