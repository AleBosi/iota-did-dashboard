import React from "react";

export default function Sidebar({
  page,
  setPage,
  did,
  onLogout,
  crediti,
}: {
  page: string;
  setPage: (v: string) => void;
  did: string;
  onLogout: () => void;
  crediti: number;
}) {
  const buttons = [
    { label: "+ Crea Nuovo Prodotto", value: "vc" },
    { label: "Storico oggetti", value: "history" },
    { label: "Importa VC JSON", value: "import" },
    { label: "Eventi", value: "events" },
    { label: "Storico crediti", value: "credits" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-72 h-screen bg-gray-900 text-white flex flex-col border-r border-gray-700 justify-between z-10">
      <div>
        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-700">
          <b className="text-3xl tracking-tight">TRUSTUP</b>

          <div className="break-all font-mono font-bold mt-4 bg-gray-800 rounded px-3 py-2 text-blue-200 text-sm">
            {did}
          </div>

          <div className="mt-3 bg-gray-800 rounded px-3 py-2 text-gray-300 font-bold flex items-center text-lg">
            Crediti:
            <span className="ml-2 font-mono text-base">{crediti}</span>
          </div>
        </div>

        {/* Menu buttons */}
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

      {/* Logout */}
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
