import React, { useState } from "react";
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
            <span className="font-semibold">{vc.type.join(", ")}</span>
            <span className="ml-2 text-gray-400">{vc.issuer}</span>
            <span className="ml-2 text-xs text-gray-400">{vc.issuanceDate}</span>
            {vc.status && <span className={`ml-2 text-xs ${vc.status === "valid" ? "text-green-600" : "text-red-600"}`}>{vc.status}</span>}
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <VCViewer vc={selected} />}
      </div>
    </div>
  );
}
