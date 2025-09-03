import React, { useEffect, useState } from "react";
import type { VerifiableCredential } from "../../models/vc";
import { verifyVC } from "../../utils/vcIntegrity";

interface Props {
  vc: VerifiableCredential;
}

/**
 * VCVerifier.tsx
 * UI per mostrare stato integrità di una VC.
 * - Usa verifyVC (fonte unica).
 * - Mostra ✅ / ❌ con messaggio.
 */
export default function VCVerifier({ vc }: Props) {
  const [result, setResult] = useState<{ valid: boolean; reason?: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await verifyVC(vc);
      if (active) setResult(res);
    })();
    return () => {
      active = false;
    };
  }, [vc]);

  if (!result) return <span className="text-gray-400">Verifica in corso...</span>;

  return (
    <div className="flex items-center gap-2">
      <span>
        Stato firma:{" "}
        {result.valid ? (
          <span className="text-green-600 font-bold">✅ Valida</span>
        ) : (
          <span className="text-red-600 font-bold">
            ❌ Non valida{result.reason ? ` — ${result.reason}` : ""}
          </span>
        )}
      </span>
    </div>
  );
}
