import React, { useEffect, useState } from "react";
import { verifyProof } from "./utilsVC";
import { Loader2 } from "lucide-react";

export default function VerifyFlag({ vc }: { vc: any }) {
  const [valid, setValid] = useState<null | boolean>(null);

  useEffect(() => {
    let mounted = true;
    verifyProof(vc).then(res => {
      if (mounted) setValid(res);
    });
    return () => {
      mounted = false;
    };
  }, [vc]);

  return (
    <span className="text-xl ml-2">
      {valid === null ? (
        <Loader2
          className="animate-spin text-gray-500 w-5 h-5 inline-block"
          title="Verifica in corso"
        />
      ) : valid ? (
        <span className="text-green-600" title="Firma valida">✅</span>
      ) : (
        <span className="text-red-500" title="Firma non valida">❌</span>
      )}
    </span>
  );
}
