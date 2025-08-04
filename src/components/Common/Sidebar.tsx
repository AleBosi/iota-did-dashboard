interface SidebarProps {
  role: "admin" | "azienda" | "creator" | "operatore" | "macchinario";
  selectedTab?: string;
  onTabSelect?: (tab: string) => void;
}

const sidebarTabs = {
  admin: [
    { label: "Aziende", tab: "aziende" },
    { label: "Crediti sistema", tab: "credits" },
    { label: "Import/Export", tab: "importexport" }
  ],
  azienda: [
    { label: "Dati azienda", tab: "info" },
    { label: "Utenti", tab: "users" },
    { label: "Prodotti", tab: "products" },
    { label: "Tipi prodotto", tab: "types" },
    { label: "Eventi", tab: "events" },
    { label: "VC", tab: "vc" },
    { label: "Crediti", tab: "credits" },
    { label: "Import/Export", tab: "importexport" },
    { label: "Gestione seed", tab: "seed" }
  ],
  creator: [
    { label: "Utenti", tab: "users" },
    { label: "Prodotti", tab: "products" },
    { label: "Eventi", tab: "events" },
    { label: "VC", tab: "vc" }
  ],
  operatore: [
    { label: "Prodotti", tab: "products" },
    { label: "Eventi", tab: "events" },
    { label: "VC", tab: "vc" },
    { label: "Crediti", tab: "credits" }
  ],
  macchinario: [
    { label: "Eventi", tab: "events" },
    { label: "VC", tab: "vc" },
    { label: "Crediti", tab: "credits" }
  ]
} as const;

export default function Sidebar({ role, selectedTab, onTabSelect }: SidebarProps) {
  const tabs = sidebarTabs[role];

  return (
    <aside className="w-64 h-full bg-white shadow-lg flex flex-col">
      <div className="font-bold text-xl px-6 py-4 border-b text-blue-800">DPP IOTA</div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {tabs.map(tab => (
            <li key={tab.tab}>
              <button
                className={`w-full text-left px-6 py-2 rounded transition ${
                  selectedTab === tab.tab
                    ? "bg-blue-100 text-blue-700 font-bold"
                    : "hover:bg-blue-50"
                }`}
                onClick={() => onTabSelect?.(tab.tab)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
