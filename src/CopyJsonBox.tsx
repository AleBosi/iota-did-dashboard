import React, { useState } from "react";

export default function CopyJsonBox({ jsonObj }: { jsonObj: any }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  return (
    <div style={{ background: "#f2f2f2ff", borderRadius: 6, padding: 14, fontFamily: "monospace", margin: 16 }}>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(jsonObj, null, 2)}</pre>
      <button onClick={handleCopy} style={{
        background: "#169c3e",
        color: "#fff",
        fontWeight: "bold",
        border: "none",
        borderRadius: 4,
        padding: "6px 18px",
        marginTop: 8,
        cursor: "pointer"
      }}>
        {copied ? "Copiato!" : "Copia JSON"}
      </button>
    </div>
  );
}
