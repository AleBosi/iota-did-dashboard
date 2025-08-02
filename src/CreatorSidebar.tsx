// src/identity/CreatorSidebar.tsx
import React from "react";

export default function CreatorSidebar({ page, setPage, onLogout }) {
  const buttons = [
    { label: "BOM", value: "bom" },
    { label: "Tipologie Prodotto", value: "tipologie" },
    { label: "Gestione Macchinari", value: "macchinari" },
    { label: "Gestione Operatori", value: "operatori" }, // Nuova voce!
    // Puoi aggiungere altre voci qui...
  ];

  return (
    <nav className="fixed top-0 left-0 w-72 h-screen bg-gray-900 text-white flex flex-col border-r border-gray-700 z-20">
      <div>
        <div className="px-6 pt-6 pb-3 border-b border-gray-700">
          <b className="text-3xl tracking-tight">TRUSTUP</b>
        </div>
        <div className="mt-6 space-y-3 px-4">
          {buttons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setPage(btn.value)}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-left text-sm transition-all
                ${
                  page === btn.value
                    ? "bg-green-600 shadow text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 mb-6 mt-8">
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
