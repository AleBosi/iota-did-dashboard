import { Azienda } from "../../../models/azienda";

interface Props {
  azienda: Azienda;
}

export default function AziendaDetails({ azienda }: Props) {
  if (!azienda) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>Ragione sociale:</b> {azienda.name}</div>
      <div><b>DID:</b> {azienda.did ?? azienda.id}</div>
      <div><b>Seed:</b> <code>{azienda.seed}</code></div>
      <div><b>P.IVA:</b> {azienda.legalInfo?.vat || "-"}</div>
      <div><b>LEI:</b> {azienda.legalInfo?.lei || "-"}</div>
      <div><b>Indirizzo:</b> {azienda.legalInfo?.address || "-"}</div>
      <div><b>Email:</b> {azienda.legalInfo?.email || "-"}</div>
      <div><b>Nazione:</b> {azienda.legalInfo?.country || "-"}</div>
      <div><b>Creatori:</b> {azienda.creators?.length ?? 0}</div>
      <div><b>Operatori:</b> {azienda.operatori?.length ?? 0}</div>
      <div><b>Macchinari:</b> {azienda.macchinari?.length ?? 0}</div>
      <div className="text-xs text-gray-400">Creato il: {azienda.createdAt ? azienda.createdAt : "-"}</div>
    </div>
  );
}
