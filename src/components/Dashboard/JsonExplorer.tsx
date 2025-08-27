import React, { useMemo, useState } from "react";
import { useData } from "../../state/DataContext";
import CopyJsonBox from "../Common/CopyJsonBox";
// Se vuoi mostrare lo stato di validità VC, sblocca la riga sotto
// import VerifyFlag from "../VC/VerifyFlag";

type DocType = "product" | "vc" | "epcis";
type Role = "azienda" | "creator" | "operatore";

interface Props {
  role?: Role; // solo etichetta UI
}

/** Preview standard minimale: Product → ProductCredential (VC JSON-LD) */
function toProductCredentialPreview(p: any) {
  return {
    "@context": ["https://www.w3.org/ns/credentials/v2", "https://schema.org/", "https://gs1.org/voc/"],
    type: ["VerifiableCredential", "ProductCredential"],
    issuer: p.owner || p.ownerDid || "did:example:issuer",
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: p.did || `did:example:product:${p.productId || "unknown"}`,
      type: ["Product", "gs1:Product"],
      gtin: p.gtin || p.typeId || undefined,
      serialNumber: p.serial || p.productId || undefined,
      name: p.name || p.productName || "Prodotto",
      brand: p.brand || undefined,
      owner: p.owner || p.ownerDid || undefined,
      digitalLink: p.gtin && p.serial ? `https://id.gs1.org/01/${p.gtin}/21/${p.serial}` : undefined
    }
  };
}

/** Preview standard da evento dominio → EPCIS 2.0 JSON-LD minimale */
function toEpcisPreviewFromEvent(e: any) {
  const createdAt = e.createdAt || e.timestamp || new Date().toISOString();
  const kind = e.kind || e.type || "event";
  const base: any = {
    "@context": "https://ref.gs1.org/epcis/2.0.0/epcis-context.jsonld",
    type: "ObjectEvent",
    eventTime: createdAt,
    eventTimeZoneOffset: "+02:00",
    action: kind === "telemetry" ? "OBSERVE" : "ADD",
    bizStep: e.bizStep || "urn:epcglobal:cbv:bizstep:production",
    disposition:
      kind === "status"
        ? (e.status === "done" || e.status === "completed"
            ? "urn:epcglobal:cbv:disp:completed"
            : "urn:epcglobal:cbv:disp:in_progress")
        : "urn:epcglobal:cbv:disp:in_progress",
  };
  if (e.productId) base.epcList = [`urn:epc:id:sgtin:example.${e.productId}`];
  if (kind === "telemetry" && e.payload) {
    base.sensorElementList = [{
      sensorMetadata: { time: createdAt },
      sensorReport: [
        e.payload.temperature != null ? { type: "gs1:Temperature", value: Number(e.payload.temperature), uom: "CEL" } : null,
        e.payload.energy != null ? { type: "gs1:Energy", value: Number(e.payload.energy), uom: "KWH" } : null,
        e.payload.vibration != null ? { type: "gs1:Vibration", value: Number(e.payload.vibration), uom: "MM/S" } : null,
      ].filter(Boolean)
    }];
  }
  if (kind === "note" && e.note) base.ilmd = { note: e.note };
  return base;
}

export default function JsonExplorer({ role = "azienda" }: Props) {
  const { products = [], events = [], vcs = [] } = (useData() as any) ?? {};

  const rows = useMemo(() => {
    const productRows = (products || []).map((p: any) => ({
      id: p.productId || p.id || p.serial || `prod-${Math.random().toString(36).slice(2)}`,
      docType: "product" as DocType,
      productType: p.typeId || null,
      eventKind: null as string | null,
      createdAt: p.createdAt || null,
      title: p.name || p.productId || "Prodotto",
      source: p,
      standardJson: toProductCredentialPreview(p),
    }));

    const vcRows = (vcs || []).map((vc: any) => ({
      id: vc.id || `vc-${Math.random().toString(36).slice(2)}`,
      docType: "vc" as DocType,
      productType: vc.credentialSubject?.typeId || vc.credentialSubject?.type || null,
      eventKind: null as string | null,
      createdAt: vc.issuanceDate || vc.validFrom || null,
      title: (Array.isArray(vc.type) ? vc.type.join(",") : vc.type) || "VC",
      source: vc,
      standardJson: vc,
    }));

    const eventRows = (events || []).map((e: any) => ({
      id: e.id || `evt-${Math.random().toString(36).slice(2)}`,
      docType: "epcis" as DocType,
      productType: e.typeId || null,
      eventKind: e.kind || e.type || null,
      createdAt: e.createdAt || e.timestamp || null,
      title: e.kind || e.type || "Evento",
      source: e,
      standardJson: toEpcisPreviewFromEvent(e),
    }));

    return [...productRows, ...vcRows, ...eventRows];
  }, [products, events, vcs]);

  // Filtri
  const [docType, setDocType] = useState<DocType | "all">("all");
  const [productType, setProductType] = useState<string | "all">("all");
  const [eventKind, setEventKind] = useState<string | "all">("all");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const productTypeOptions = useMemo(
    () => Array.from(new Set(rows.map(r => r.productType).filter(Boolean))) as string[],
    [rows]
  );
  const eventKindOptions = useMemo(
    () => Array.from(new Set(rows.map(r => r.eventKind).filter(Boolean))) as string[],
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (docType !== "all" && r.docType !== docType) return false;
      if (productType !== "all" && r.productType !== productType) return false;
      if (eventKind !== "all" && r.eventKind !== eventKind) return false;

      if (dateFrom) {
        const t = r.createdAt ? +new Date(r.createdAt) : 0;
        if (t && t < +new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const t = r.createdAt ? +new Date(r.createdAt) : 0;
        if (t && t > +new Date(dateTo)) return false;
      }

      if (q.trim()) {
        const needle = q.toLowerCase();
        const hay =
          (r.title || "").toLowerCase() +
          " " +
          JSON.stringify(r.source || {}).toLowerCase() +
          " " +
          JSON.stringify(r.standardJson || {}).toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, docType, productType, eventKind, q, dateFrom, dateTo]);

  function exportCurrent() {
    const blob = new Blob([JSON.stringify(filtered.map(f => f.standardJson), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `json-export-${role}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">JSON Center — {role}</h2>
        <p className="text-gray-600">Visualizza e filtra Product JSON-LD, VC e eventi EPCIS (preview).</p>
      </div>

      {/* FILTRI */}
      <div className="bg-white rounded-2xl shadow p-4 grid md:grid-cols-5 gap-3">
        <div>
          <label className="text-sm text-gray-600">Documento</label>
          <select className="mt-1 w-full border rounded p-2"
            value={docType} onChange={e => setDocType(e.target.value as any)}>
            <option value="all">Tutti</option>
            <option value="product">Product</option>
            <option value="vc">VC</option>
            <option value="epcis">EPCIS Event</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Tipo Prodotto</label>
          <select className="mt-1 w-full border rounded p-2"
            value={productType} onChange={e => setProductType(e.target.value as any)}>
            <option value="all">Tutti</option>
            {productTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Tipo Evento</label>
          <select className="mt-1 w-full border rounded p-2"
            value={eventKind} onChange={e => setEventKind(e.target.value as any)}>
            <option value="all">Tutti</option>
            {eventKindOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Da</label>
          <input type="date" className="mt-1 w-full border rounded p-2"
            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">A</label>
          <input type="date" className="mt-1 w-full border rounded p-2"
            value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="md:col-span-5">
          <label className="text-sm text-gray-600">Cerca</label>
          <input
            className="mt-1 w-full border rounded p-2"
            placeholder="Testo libero su titoli e JSON…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="md:col-span-5 flex justify-end">
          <button className="px-3 py-2 border rounded" onClick={exportCurrent}>
            Esporta risultati (JSON)
          </button>
        </div>
      </div>

      {/* RISULTATI */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-gray-600">Nessun risultato con i filtri correnti.</div>
        )}
        {filtered.map(r => (
          <div key={`${r.docType}-${r.id}`} className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-gray-500">ID</div>
                <div className="font-mono text-sm break-all">{r.id}</div>
                <div className="mt-1 text-xs text-gray-500">Tipo documento</div>
                <div className="text-sm">{r.docType.toUpperCase()}</div>
                {r.productType && (
                  <>
                    <div className="mt-1 text-xs text-gray-500">Tipo prodotto</div>
                    <div className="text-sm">{r.productType}</div>
                  </>
                )}
                {r.eventKind && (
                  <>
                    <div className="mt-1 text-xs text-gray-500">Tipo evento</div>
                    <div className="text-sm">{r.eventKind}</div>
                  </>
                )}
                {r.createdAt && (
                  <>
                    <div className="mt-1 text-xs text-gray-500">Data</div>
                    <div className="text-sm">{new Date(r.createdAt).toLocaleString("it-IT")}</div>
                  </>
                )}
              </div>
              <div className="text-right">
                {/* {r.docType === "vc" && <VerifyFlag vc={r.source} />} */}
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Sorgente (domain JSON)</div>
                <CopyJsonBox data={r.source} />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Preview standard</div>
                <CopyJsonBox data={r.standardJson} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
