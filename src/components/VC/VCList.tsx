import { useState } from "react";
import { VerifiableCredential } from "../../models/vc";
import VCViewer from "./VCViewer";

interface Props {
  vcs: VerifiableCredential[];
  onSelect?: (vc: VerifiableCredential) => void;
}

export default function VCList({ vcs, onSelect }: Props) {
  const [selected, setSelected] = useState<VerifiableCredential | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {vcs.map(vc => (
          <li
            key={vc.id}
            className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
            onClick={() => {
              setSelected(vc);
              onSelect?.(vc);
            }}
          >
            <span className="font-semibold">{vc.type[1] || vc.type[0]}</span>
            <span className="ml-2 text-gray-400">{vc.issuer}</span>
            <span className="ml-2 text-xs text-gray-400">{vc.issuanceDate}</span>
            {/* Status estratto da credentialSubject */}
            {vc.credentialSubject?.status && (
              <span className={`ml-2 text-xs ${vc.credentialSubject.status === "valid" ? "text-green-600" : "text-red-600"}`}>
                {vc.credentialSubject.status}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {/* Mappatura dati per VCViewer */}
        {selected && (
          <VCViewer
            vc={{
              subject: selected.credentialSubject.id,
              type: selected.type[1] || selected.type[0],
              value: selected.credentialSubject.value,
              issuedAt: selected.issuanceDate,
              issuer: selected.issuer
            }}
          />
        )}
      </div>
    </div>
  );
}
