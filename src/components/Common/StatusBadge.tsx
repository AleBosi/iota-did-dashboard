import React from "react";
import { AssignmentStatus } from "@/models/event";

export default function StatusBadge({ status }: { status: AssignmentStatus }) {
  const map: Record<AssignmentStatus, string> = {
    queued: "bg-muted text-muted-foreground border border-border",
    in_progress: "bg-blue-600/90 text-white",
    done: "bg-emerald-600/90 text-white",
    cancelled: "bg-destructive text-destructive-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}
