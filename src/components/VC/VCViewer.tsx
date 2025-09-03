import React from "react";
import type { VerifiableCredential } from "../../models/vc";
import VerifyFlag from "./VerifyFlag";

/**
 * VCViewer.tsx
 * - Dettaglio read-only di una Verifiable Credential completa.
 * - Non modifica MAI `proof` o `eventHistory`.
 * - Mostra VerifyFlag (usa verifyVC) + JSON prettificato.
 */
export default function VCViewer({ vc }: { vc: VerifiableCredential }) {
  const title = Array.isArray(vc.type) ? (vc.type[1] || vc.type[0]) : String(vc.type);

  return (
    <div className="border rounded-xl p-4 bg-gray-50 mb-2 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold truncate">Verifiable Credential — {title}</h3>
        <VerifyFlag vc={vc} />
      </div>

      <div className="text-sm grid grid-cols-1 gap-1">
        <div><b>Issuer:</b> {vc.issuer}</div>
        <div><b>Issued at:</b> {vc.issuanceDate}</div>
        {/* Mostriamo il subject se presente in modo amichevole */}
        {(vc as any).credentialSubject?.id && (
          <div><b>Subject:</b> {(vc as any).credentialSubject.id}</div>
        )}
      </div>

      {/* JSON completo read-only (proof + tutto il resto) */}
      <div>
        <div className="font-medium mb-1">Payload (read-only)</div>
        <pre className="bg-white border rounded-xl p-3 overflow-auto text-xs">
          {JSON.stringify(vc, null, 2)}
        </pre>
      </div>

      {/* eventHistory è out-of-proof: lo mostriamo ma non lo tocchiamo */}
      {"eventHistory" in (vc as any) && (
        <div>
          <div className="font-medium mb-1">Event History (out-of-proof)</div>
          <pre className="bg-white border rounded-xl p-3 overflow-auto text-xs">
            {JSON.stringify((vc as any).eventHistory, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
