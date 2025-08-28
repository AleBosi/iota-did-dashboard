import React from "react";

type UserInfo = {
  username?: string;
  role?: string;
};

export default function Header({
  user,
  onLogout,
  rightSlot,
}: {
  user?: UserInfo;
  onLogout?: () => void;
  rightSlot?: React.ReactNode;
}) {
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
              {user?.role ? (
                <span className="uppercase tracking-wide">{user.role}</span>
              ) : (
                <span>Utente</span>
              )}
            </div>
            <div className="text-base font-medium leading-none truncate">
              {user?.username ?? "Account"}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {rightSlot}
            {onLogout && (
              <button
                onClick={onLogout}
                className="
                  inline-flex items-center rounded-md
                  bg-muted px-3 py-2 text-sm
                  text-foreground/90 border border-border
                  hover:bg-muted/70 transition
                "
              >
                Esci
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
