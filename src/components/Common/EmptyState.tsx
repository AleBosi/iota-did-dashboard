import React from "react";

export default function EmptyState({
  title = "Nessun dato",
  description = "Non ci sono elementi da mostrare.",
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="rounded-full border border-border/70 bg-muted/30 h-12 w-12 flex items-center justify-center mb-3">
        <span className="text-muted-foreground">∅</span>
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
