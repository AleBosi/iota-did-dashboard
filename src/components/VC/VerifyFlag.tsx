import React, { useEffect, useState } from "react";
import type { VerifiableCredential } from "../../models/vc";
import { verifyVC } from "../../utils/vcIntegrity";

interface Props {
  vc: VerifiableCredential;
}

/**
 * VerifyFlag.tsx
 * UI-only component:
 * - Verifica integrità di una VC tramite verifyVC (fonte unica).
 * - Mostra ✅ se valida, ❌ se non valida (con tooltip motivazione).
 */
export default function VerifyFlag({ vc }: Props) {
  const [result, setResult] = useState<{ ok: boolean; reason?: string }>({ ok: false });

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await verifyVC(vc);
      if (active) {
        setResult({ ok: res.valid, reason: res.reason });
      }
    })();
    return () => {
      active = false;
    };
  }, [vc]);

  return (
    <span
      className={`ml-2 text-xl ${result.ok ? "text-green-600" : "text-red-600"}`}
      title={result.ok ? "VC integra" : result.reason || "VC non valida"}
    >
      {result.ok ? "✅" : "❌"}
    </span>
  );
}
