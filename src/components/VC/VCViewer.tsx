import React from "react";

interface VCData {
  subject: string;
  type: string;
  value: string;
  issuedAt?: string;
  issuer?: string;
}

interface Props {
  vc: VCData;
}

export default function VCViewer({ vc }: Props) {
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>Subject:</b> {vc.subject}</div>
      <div><b>Tipo:</b> {vc.type}</div>
      <div><b>Valore:</b> {vc.value}</div>
      {vc.issuer && <div><b>Issuer:</b> {vc.issuer}</div>}
      {vc.issuedAt && <div><b>Emessa il:</b> {vc.issuedAt}</div>}
    </div>
  );
}
