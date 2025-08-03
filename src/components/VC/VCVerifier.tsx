import React from "react";

interface VCData {
  subject: string;
  type: string;
  value: string;
  proof?: {
    hash: string;
    signature: string;
  };
}

interface Props {
  vc: VCData;
  verify: (vc: VCData) => boolean;
}

export default function VCVerifier({ vc, verify }: Props) {
  const isValid = verify(vc);

  return (
    <div className="flex items-center gap-2">
      <span>
        Stato firma:{" "}
        {isValid ? (
          <span className="text-green-600 font-bold">✅ Valida</span>
        ) : (
          <span className="text-red-600 font-bold">❌ Non valida</span>
        )}
      </span>
    </div>
  );
}
