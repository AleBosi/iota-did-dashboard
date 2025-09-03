import React, { useState } from "react";
import type { VerifiableCredential } from "../../models/vc";
import VCViewer from "./VCViewer";
import VerifyFlag from "./VerifyFlag";

interface Props {
  vcs: VerifiableCredential[];
  onSelect?: (vc: VerifiableCredential) => void;
}

/**
 * VCList.tsx
 * - Elenco VC con metadati principali
 * - Mostra VerifyFlag per ogni VC (usa verifyVC internamente)
 * - Seleziona una VC e la passa a VCViewer (read-only)
 */
export default function VCList({ vcs, onSelect }: Props) {
  const [selected, setSelected] = useState<VerifiableCredential | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {vcs.map((vc) => {
          const title = Array.isArray(vc.type) ? (vc.type[1] || vc.type[0]) : String(vc.type);
          return (
            <li
              key={(vc as any).id ?? `${vc.issuer}-${vc.issuanceDate}-${title}`}
              className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded-lg flex items-center justify-between"
              onClick={() => {
                setSelected(vc);
                onSelect?.(vc);
              }}
            >
              <div className="min-w-0">
                <span className="font-semibold truncate">{title}</span>
                <span className="ml-2 text-gray-400">{vc.issuer}</span>
                <span className="ml-2 text-xs text-gray-400">{vc.issuanceDate}</span>
                {/* Badge status opzionale dal credentialSubject (solo UI) */}
                {(vc as any).credentialSubject?.status && (
                  <span
                    className={`ml-2 text-xs ${
                      (vc as any).credentialSubject.status === "valid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(vc as any).credentialSubject.status}
                  </span>
                )}
              </div>
              {/* Stato integrità (usa verifyVC) */}
              <VerifyFlag vc={vc} />
            </li>
          );
        })}
      </ul>

      <div className="w-1/2">
        {selected && <VCViewer vc={selected} />}
      </div>
    </div>
  );
}
