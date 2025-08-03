import React from "react";

interface Props {
  value: string;
  label?: string;
}

export default function HashDisplay({ value, label }: Props) {
  return (
    <div className="bg-gray-100 p-2 rounded mb-1 flex items-center">
      {label && <span className="font-bold mr-2">{label}</span>}
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}
