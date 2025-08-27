import React from "react";

type Item = { id: string; label: string; icon?: string };

export default function Sidebar({
  title,
  subtitle,
  items,
  activeItem,
  onItemClick,
  onLogout,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
  onLogout?: () => void;
}) {
  return (
    <aside className="w-56 min-h-screen border-r border-gray-200 bg-white">
      <div className="p-4 border-b">
        <div className="text-lg font-bold">{title}</div>
        {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
      </div>

      <nav className="p-2 space-y-1">
        {items?.length ? (
          items.map((it) => (
            <button
              key={it.id}
              onClick={() => onItemClick && onItemClick(it.id)}
              className={
                "w-full text-left px-3 py-2 rounded " +
                (activeItem === it.id
                  ? "bg-gray-900 text-white"
                  : "hover:bg-gray-100")
              }
            >
              <span className="mr-2">{it.icon || "•"}</span>
              {it.label}
            </button>
          ))
        ) : (
          <div className="text-xs text-gray-400 px-3">Nessuna voce</div>
        )}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={onLogout}
          className="w-full border border-gray-300 rounded px-3 py-2 hover:bg-gray-100"
        >
          Esci
        </button>
      </div>
    </aside>
  );
}
