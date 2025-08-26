import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

const itemsByRole: Record<string, { to: string; label: string }[]> = {
  admin: [{ to: "/admin", label: "Dashboard" }],
  azienda: [{ to: "/azienda", label: "Dashboard" }],
  creator: [{ to: "/creator", label: "Dashboard" }],
  operatore: [{ to: "/operatore", label: "Dashboard" }],
  macchinario: [{ to: "/macchinario", label: "Dashboard" }]
};

export default function Sidebar() {
  const { session } = useUser();
  const role = session?.role || "admin";
  const items = itemsByRole[role] || [];
  const loc = useLocation();

  return (
    <aside className="w-64 bg-white border-r h-screen p-4">
      <div className="font-bold mb-4">TRUSTUP</div>
      <nav className="space-y-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={`block px-3 py-2 rounded ${loc.pathname === it.to ? "bg-gray-200 font-medium" : "hover:bg-gray-50"}`}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
