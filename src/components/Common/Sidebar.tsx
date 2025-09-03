import React, { useMemo } from "react";
import { useUser } from "../../contexts/UserContext";
// (opzionale) se vuoi gestire apertura/chiusura via AppContext:
// import { useApp } from "../../contexts/AppContext";

type UserRole = "admin" | "azienda" | "creator" | "operatore" | "macchinario";

type Item = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** se presente, la voce è visibile solo a questi ruoli */
  roles?: UserRole[];
};

type Props = {
  title?: string;
  subtitle?: string;
  items: Item[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
};

export default function Sidebar({
  title = "TRUSTUP",
  subtitle,
  items,
  activeItem,
  onItemClick,
}: Props) {
  const { session, currentActor, logout } = useUser();
  const role = (session?.role || currentActor?.role || "utente") as UserRole;

  // Se un item ha "roles", lo mostro solo se include il ruolo corrente
  const visibleItems = useMemo(
    () =>
      (items || []).filter((it) =>
        Array.isArray(it.roles) ? it.roles.includes(role) : true
      ),
    [items, role]
  );

  return (
    <aside
      className="
        h-screen w-[240px]
        border-r border-border
        bg-card/30 text-card-foreground
        sticky top-0
        hidden md:flex md:flex-col
      "
    >
      {/* Brand */}
      <div className="px-4 pt-4 pb-3 border-b border-border/60">
        <div className="text-sm font-semibold tracking-wide">{title}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {subtitle}
          </div>
        )}
        <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {String(role)}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">
          {visibleItems.map((it) => {
            const active = it.id === activeItem;
            const base =
              "w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border";
            const cls = active
              ? "bg-primary/10 border-border text-foreground"
              : "bg-transparent border-transparent text-foreground/90 hover:bg-card/70 hover:border-border";
            return (
              <li key={it.id}>
                <button
                  disabled={it.disabled}
                  onClick={() => !it.disabled && onItemClick?.(it.id)}
                  className={`${base} ${cls} ${
                    it.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {it.icon ? <span className="shrink-0">{it.icon}</span> : null}
                  <span className="truncate">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border/60">
        <button
          onClick={logout}
          className="
            w-full inline-flex items-center justify-center rounded-md
            bg-muted px-3 py-2 text-sm text-foreground/90
            border border-border hover:bg-muted/70 transition
          "
        >
          Esci
        </button>
      </div>
    </aside>
  );
}
