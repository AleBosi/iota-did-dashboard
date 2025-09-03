import React, { useMemo } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";

type Props = {
  rightSlot?: React.ReactNode;
};

export default function Header({ rightSlot }: Props) {
  const { currentActor, session, logout } = useUser();
  const { getCredits } = useData();

  const role = (session?.role || currentActor?.role || "utente").toString().toUpperCase();
  const name = currentActor?.name || currentActor?.username || "Account";

  const did = currentActor?.did;
  const didShort = useMemo(() => {
    if (!did) return null;
    const s = String(did);
    return s.length > 22 ? `${s.slice(0, 10)}…${s.slice(-8)}` : s;
  }, [did]);

  const credits = currentActor?.did ? getCredits?.(currentActor.did) ?? 0 : undefined;

  return (
    <header
      className="
        sticky top-0 z-40
        border-b border-border
        bg-background/80 backdrop-blur
        supports-[backdrop-filter]:bg-background/60
      "
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Left: user info */}
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground leading-none">
              <span className="uppercase tracking-wide">{role}</span>
            </div>
            <div className="text-base font-medium leading-none truncate">
              {name}
              {didShort && (
                <span className="ml-2 text-xs text-muted-foreground align-middle">
                  ({didShort})
                </span>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {typeof credits === "number" && (
              <span className="text-xs rounded-full border border-border px-2 py-1 bg-muted">
                💳 {credits} crediti
              </span>
            )}
            {rightSlot}
            <button
              onClick={logout}
              className="
                inline-flex items-center rounded-md
                bg-muted px-3 py-2 text-sm
                text-foreground/90 border border-border
                hover:bg-muted/70 transition
              "
              title="Esci"
            >
              Esci
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
