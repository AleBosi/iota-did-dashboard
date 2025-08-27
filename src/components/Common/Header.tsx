import React from "react";

export default function Header({
  title,
  subtitle,
  rightActions,
}: {
  title: string;
  subtitle?: string;
  rightActions?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {rightActions ? <div className="flex items-center gap-2">{rightActions}</div> : null}
      </div>
    </div>
  );
}
