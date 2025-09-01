import React, { useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";
import VerifyFlag from "../VC/VerifyFlag";
import { uid } from "../../utils/storage";
import SectionCard from "../Common/SectionCard";
import EmptyState from "../Common/EmptyState";

// opzionale: utility integrità VC se presente
let vcUtils: any = {};
try {
  // @ts-ignore
  vcUtils = require("../../utils/vcIntegrity");
} catch {
  /* opzionale */
}

/* -------- Helpers -------- */
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
const lc = (s: any) => String(s || "").toLowerCase();

type Tab = "overview" | "types" | "products" | "assignments" | "compose" | "vcs" | "json";

export default function CreatorDashboard() {
  const { session, logout } = useUser();
  const {
    aziende,
    actors,
    products,
    productTypes,
    vcs,
    events,
    credits,

    addProductType,
    updateProductType,
    removeProductType,
    addProduct,
    updateProduct,
    removeProduct,
    addVC,
    updateVC,
    addEvent,
    spendFromActor,
  } = (useData() as any) ?? {};

  /* ===== Creator corrente ===== */
  const currentCreator = useMemo(() => {
    const sessDid = (session as any)?.did || (session as any)?.entityId;
    if (session?.role === "creator" && sessDid) {
      const match = (actors || []).find(
        (a: any) => lc(a?.id || a?.did) === lc(sessDid)
      );
      if (match) return match;
    }
    return (actors || []).find((a: any) => a.role === "creator");
  }, [actors, session?.role, (session as any)?.did, (session as any)?.entityId]);

  const myAzienda = useMemo(() => {
    if (!currentCreator) return undefined;
    const ownerDid =
      currentCreator.owner ||
      currentCreator.ownerDid ||
      currentCreator.aziendaDid;
    if (!ownerDid) return undefined;
    return (aziende || []).find((a: any) => lc(a.id || a.did) === lc(ownerDid));
  }, [aziende, currentCreator]);

  const creatorDid = currentCreator?.id;
  const creatorCredits = (creatorDid && credits?.byActor?.[creatorDid]) || 0;

  const [tab, setTab] = useState<Tab>("overview");
  const sidebarItems = [
    { id: "overview", label: "🏠 Overview" },
    { id: "types", label: "📑 Types & Policy" },
    { id: "products", label: "📦 Prodotti & BOM" },
    { id: "assignments", label: "🗓️ Eventi/Assegnazioni" },
    { id: "compose", label: "✒️ VC/DPP Composer" },
    { id: "vcs", label: "📜 VC/DPP Pubblicate" },
    { id: "json", label: "🧾 JSON Center" },
  ];

  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      window.location.href = "/login?reset=1";
    }
  };

  const copy = (txt: string) => {
    try {
      navigator.clipboard.writeText(txt);
    } catch {}
  };

  /* =========================================================
   *  TYPES & POLICY
   * =======================================================*/
  const [tName, setTName] = useState("");
  const [tVersion, setTVersion] = useState("1.0.0");
  const [tPolicy, setTPolicy] = useState("");
  const [tAttrs, setTAttrs] = useState("serial,batch,origin");
  const [editType, setEditType] = useState<any | null>(null);

  const typesForAzienda = useMemo(() => {
    if (!myAzienda?.id) return productTypes || [];
    return (productTypes || []).filter(
      (t: any) => !t.owner || lc(t.owner) === lc(myAzienda.id)
    );
  }, [productTypes, myAzienda?.id]);

  const onAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;
    const obj = {
      id: `ptype_${uid(8)}`,
      name: tName.trim(),
      version: tVersion || "1.0.0",
      policy: tPolicy?.trim() || "",
      attributes: tAttrs.split(",").map((s) => s.trim()).filter(Boolean),
      owner: myAzienda?.id || null,
      createdAt: new Date().toISOString(),
      createdBy: creatorDid,
    };
    addProductType?.(obj);
    setTName("");
    setTVersion("1.0.0");
    setTPolicy("");
    setTAttrs("serial,batch,origin");
  };

  /* =========================================================
   *  PRODUCTS & BOM
   * =======================================================*/
  const [pName, setPName] = useState("");
  const [pTypeId, setPTypeId] = useState("");
  const [pAttrs, setPAttrs] = useState("serial=,batch=");
  const [bomItems, setBomItems] = useState<Array<{ componentId: string; qty: number }>>([]);
  const [editProduct, setEditProduct] = useState<any | null>(null);

  const productsForAzienda = useMemo(() => {
    if (!myAzienda?.id) return products || [];
    return (products || []).filter(
      (p: any) =>
        lc(p.owner || p.ownerDid || p.aziendaDid) === lc(myAzienda.id)
    );
  }, [products, myAzienda?.id]);

  const onAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pTypeId) {
      alert("Completa Nome e Type");
      return;
    }
    const prodId = `prod_${uid(10)}`;
    const attrs: Record<string, string> = {};
    (pAttrs || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [k, ...rest] = pair.split("=");
        attrs[k] = rest.join("=") || "";
      });
    const obj: any = {
      id: prodId,
      productId: prodId,
      name: pName.trim(),
      productName: pName.trim(),
      productTypeId: pTypeId,
      typeId: pTypeId,
      owner: myAzienda?.id || null,
      createdAt: new Date().toISOString(),
      status: "draft",
      attributes: attrs,
      bom: { items: bomItems.slice() },
      onChain: undefined as undefined | { hash: string; uri?: string; anchoredAt: string },
    };
    addProduct?.(obj);
    setPName("");
    setPTypeId("");
    setPAttrs("serial=,batch=");
    setBomItems([]);
  };

  const [anchorBusy, setAnchorBusy] = useState<string>("");
  async function anchorProductOnChain(prod: any) {
    try {
      setAnchorBusy(prod.id);
      const payload = {
        id: prod.id,
        name: prod.name || prod.productName,
        typeId: prod.productTypeId || prod.typeId,
        owner: prod.owner || prod.ownerDid || prod.aziendaDid,
        attributes: prod.attributes || {},
        bom: prod.bom || {},
      };
      const hash = await sha256Hex(JSON.stringify(payload));
      const updated = {
        ...prod,
        onChain: {
          hash,
          uri: `evm:iota:anchor:${hash.slice(0, 16)}`,
          anchoredAt: new Date().toISOString(),
        },
        status: "anchored",
      };
      updateProduct?.(updated);
    } finally {
      setAnchorBusy("");
    }
  }

  /* =========================================================
   *  ASSIGNMENTS / EVENTI — **contratto esatto**
   * =======================================================*/
  const [asProductIdsCsv, setAsProductIdsCsv] = useState("");
  const [asPriority, setAsPriority] = useState<"low" | "medium" | "high">("medium");
  const [asInstructions, setAsInstructions] = useState("");
  const [asMessage, setAsMessage] = useState("");
  const [asOperatorDid, setAsOperatorDid] = useState("");
  const [asMachineDid, setAsMachineDid] = useState("");
  const [eventCost, setEventCost] = useState(1);

  const teamOfAzienda = useMemo(
    () =>
      (actors || []).filter(
        (a: any) =>
          lc(a.owner || a.ownerDid || a.aziendaDid) === lc(myAzienda?.id)
      ),
    [actors, myAzienda?.id]
  );
  const operators = teamOfAzienda.filter((a: any) => a.role === "operatore");
  const machines = teamOfAzienda.filter((a: any) => a.role === "macchinario");

  function createAssignments(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorDid) {
      alert("Creator non identificato");
      return;
    }
    const list = asProductIdsCsv.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) {
      alert("Specifica almeno un productId");
      return;
    }
    const ok = spendFromActor?.(creatorDid, eventCost, `Creazione assegnazioni (${list.length})`);
    if (!ok) {
      alert("Crediti insufficienti");
      return;
    }

    const now = new Date().toISOString();
    const batchId = `as_${uid(8)}`;

    list.forEach((pid) => {
      const prod = (productsForAzienda as any[]).find((p) => (p.productId || p.id) === pid);
      const typeId = prod?.productTypeId || prod?.typeId || "";

      const ev: any = {
        id: `ev_${uid(8)}`,
        kind: "assignment",
        productId: pid,
        typeId,
        productName: prod?.name || prod?.productName,
        instructions: asInstructions || undefined,
        priority: asPriority || undefined,
        assignedOperatorDid: asOperatorDid || undefined,
        assignedMachineDid: asMachineDid || undefined,
        message: asMessage || "",
        createdByDid: creatorDid,
        createdAt: now,
        // extra non vincolanti ma utili
        ownerDid: myAzienda?.id || null,
        batchId,
      };
      addEvent?.(ev);
    });

    setAsMessage("");
    setAsInstructions("");
    setAsProductIdsCsv("");
    setAsOperatorDid("");
    setAsMachineDid("");
    alert(`Assegnazioni create per ${list.length} prodotto/i`);
  }

  /* =========================================================
   *  VC/DPP COMPOSER (con proof.jws = SHA-256 del payload senza proof/eventHistory)
   * =======================================================*/
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [payloadData, setPayloadData] = useState('{"quality":"A","notes":""}');
  const [publishCost, setPublishCost] = useState(5);

  async function composeAndPublishVC(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorDid) {
      alert("Creator non identificato");
      return;
    }
    if (!selectedProductId || !selectedTypeId) {
      alert("Seleziona Prodotto e Type");
      return;
    }

    const ok = spendFromActor?.(creatorDid, publishCost, "Pubblicazione VC/DPP");
    if (!ok) {
      alert("Crediti insufficienti per pubblicare");
      return;
    }

    const product = (productsForAzienda as any[]).find((p) => (p.productId || p.id) === selectedProductId);
    const ptype = (typesForAzienda as any[]).find((t) => t.id === selectedTypeId);

    let userPayload: any = {};
    try {
      userPayload = JSON.parse(payloadData || "{}");
    } catch {
      alert("JSON payload non valido");
      return;
    }

    let vc: any = {
      id: `vc_${uid(10)}`,
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "DPP"],
      issuer: creatorDid,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        product: {
          id: selectedProductId,
          name: product?.name || product?.productName || "",
          typeId: selectedTypeId,
          typeName: ptype?.name || "",
        },
        data: userPayload,
      },
      eventHistory: [],
      status: "active",
      version: "1.0.0",
      owner: myAzienda?.id || null,
      createdBy: creatorDid, // metadato interno
    };

    if (vcUtils?.makeVCIntegrity) {
      vc = await vcUtils.makeVCIntegrity(vc);
    } else {
      const clone = JSON.parse(JSON.stringify(vc));
      delete clone.proof;
      delete clone.eventHistory;
      const jws = await sha256Hex(JSON.stringify(clone));
      vc.proof = { type: "DataIntegrityProof", jws };
    }

    addVC?.(vc);
    alert("VC/DPP pubblicata (mock)");
  }

  /* =========================================================
   *  VC LIST (revoca/versioning)
   * =======================================================*/
  const myVCs = useMemo(
    () => (vcs || []).filter((v: any) => v.createdBy === creatorDid || v.issuer === creatorDid),
    [vcs, creatorDid]
  );

  const revokeVC = (id: string) => {
    const v = (vcs as any[]).find((x) => (x.id || x["@id"]) === id);
    if (!v) return;
    updateVC?.({ ...v, status: "revoked" });
  };

  const bumpMinor = (id: string) => {
    const v = (vcs as any[]).find((x) => (x.id || x["@id"]) === id);
    if (!v) return;
    const parts = String(v.version || "1.0.0")
      .split(".")
      .map((n: any) => parseInt(n || 0, 10));
    const next = `${parts[0]}.${(parts[1] || 0) + 1}.0`;
    updateVC?.({ ...v, version: next });
  };

  /* =========================================================
   *  RENDER
   * =======================================================*/
  return (
    <div className="creator-scope min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Scope locale per neutralizzare eventuali classi legacy dei figli */}
      <style>{`
        .creator-scope .bg-white { background-color: hsl(var(--card)) !important; }
        .creator-scope .bg-gray-50 { background-color: hsl(var(--muted)) !important; }
        .creator-scope .text-gray-500,
        .creator-scope .text-gray-600,
        .creator-scope .text-gray-700 { color: hsl(var(--muted-foreground)) !important; }
        .creator-scope .border-gray-100,
        .creator-scope .border-gray-200,
        .creator-scope .border-gray-300 { border-color: hsl(var(--border)) !important; }
        .creator-scope input, .creator-scope textarea, .creator-scope select {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          border-color: hsl(var(--border));
        }
      `}</style>

      <div className="flex min-h-screen w-full">
        <aside className="shrink-0">
          <Sidebar
            title="TRUSTUP"
            subtitle={`Creator ${currentCreator?.name || ""}`}
            items={sidebarItems}
            activeItem={tab}
            onItemClick={(id) => setTab(id as Tab)}
            onLogout={handleLogout}
          />
        </aside>

        <section className="flex-1 min-w-0 flex flex-col">
          <Header
            user={{ username: currentCreator?.name || "Creator", role: "creator" }}
            onLogout={handleLogout}
          />

          <div className="flex-1">
            <main className="max-w-7xl mx-auto w-full p-6">
              {/* OVERVIEW */}
              {tab === "overview" && (
                <div className="space-y-6">
                  <SectionCard title="Identità Creator" subtitle="Dettagli profilo e statistiche principali">
                    {currentCreator ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div>
                            <strong>Nome:</strong> {currentCreator.name || "-"}
                          </div>
                          <div>
                            <strong>Ruolo:</strong> {currentCreator.role || "-"}
                          </div>
                          <div className="break-all">
                            <strong>DID:</strong>{" "}
                            <code className="text-xs">{currentCreator.id}</code>{" "}
                            <button className="underline" onClick={() => copy(currentCreator.id)}>
                              Copia
                            </button>
                          </div>
                          {currentCreator.seed && (
                            <div className="break-all">
                              <strong>Seed:</strong>{" "}
                              <code className="text-xs">{currentCreator.seed}</code>{" "}
                              <button className="underline" onClick={() => copy(currentCreator.seed)}>
                                Copia
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <div>
                            <strong>Azienda:</strong> {myAzienda?.name || "-"}
                          </div>
                          <div>
                            <strong>Saldo crediti (creator):</strong>{" "}
                            {Number(creatorCredits).toLocaleString()}
                          </div>
                          <div>
                            <strong>Prodotti (azienda):</strong>{" "}
                            {(productsForAzienda || []).length}
                          </div>
                          <div>
                            <strong>VC create:</strong> {myVCs.length}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyState title="Nessun creator individuato" />
                    )}
                  </SectionCard>
                </div>
              )}

              {/* TYPES & POLICY */}
              {tab === "types" && (
                <div className="space-y-6">
                  <SectionCard title="Nuovo Product Type">
                    <form onSubmit={onAddType} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        className="border border-border rounded px-3 py-2"
                        placeholder="Nome"
                        value={tName}
                        onChange={(e) => setTName(e.target.value)}
                      />
                      <input
                        className="border border-border rounded px-3 py-2"
                        placeholder="Versione"
                        value={tVersion}
                        onChange={(e) => setTVersion(e.target.value)}
                      />
                      <input
                        className="border border-border rounded px-3 py-2 md:col-span-2"
                        placeholder="Policy (testo libero)"
                        value={tPolicy}
                        onChange={(e) => setTPolicy(e.target.value)}
                      />
                      <input
                        className="border border-border rounded px-3 py-2 md:col-span-4"
                        placeholder="Attributi (csv)"
                        value={tAttrs}
                        onChange={(e) => setTAttrs(e.target.value)}
                      />
                      <button
                        className="bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90 md:col-span-1"
                        type="submit"
                      >
                        Aggiungi
                      </button>
                    </form>
                  </SectionCard>

                  <SectionCard title={`Elenco Types (${typesForAzienda.length})`}>
                    {typesForAzienda.length === 0 ? (
                      <EmptyState title="Nessun type definito" />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2 pr-4">Nome</th>
                              <th className="py-2 pr-4">Versione</th>
                              <th className="py-2 pr-4">Policy</th>
                              <th className="py-2 pr-4">Attributi</th>
                              <th className="py-2 pr-4">Azioni</th>
                            </tr>
                          </thead>
                          <tbody>
                            {typesForAzienda.map((t: any) => (
                              <tr key={t.id} className="border-t border-border/60">
                                <td className="py-2 pr-4">{t.name}</td>
                                <td className="py-2 pr-4">{t.version}</td>
                                <td className="py-2 pr-4">{t.policy || "-"}</td>
                                <td className="py-2 pr-4">{(t.attributes || []).join(", ")}</td>
                                <td className="py-2 pr-4 space-x-2">
                                  <button
                                    className="border border-border rounded px-3 py-1 hover:bg-muted"
                                    onClick={() => setEditType(t)}
                                  >
                                    Modifica
                                  </button>
                                  <button
                                    className="border border-red-400 text-red-600 rounded px-3 py-1 hover:bg-red-500/10"
                                    onClick={() => removeProductType?.(t.id)}
                                  >
                                    Elimina
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>

                  {editType && (
                    <SectionCard title="Modifica Type">
                      <TypeEditor
                        value={editType}
                        onCancel={() => setEditType(null)}
                        onSave={(v) => {
                          updateProductType?.(v);
                          setEditType(null);
                        }}
                      />
                    </SectionCard>
                  )}
                </div>
              )}

              {/* PRODUCTS & BOM */}
              {tab === "products" && (
                <div className="space-y-6">
                  <SectionCard title="Nuovo Prodotto">
                    <form onSubmit={onAddProduct} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <input
                        className="border border-border rounded px-3 py-2 md:col-span-2"
                        placeholder="Nome prodotto"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                      />
                      <select
                        className="border border-border rounded px-3 py-2 md:col-span-2"
                        value={pTypeId}
                        onChange={(e) => setPTypeId(e.target.value)}
                      >
                        <option value="">Type…</option>
                        {(typesForAzienda as any[]).map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.name} v{t.version}
                          </option>
                        ))}
                      </select>
                      <input
                        className="border border-border rounded px-3 py-2 md:col-span-2"
                        placeholder="Attributi (csv es. serial=,batch=)"
                        value={pAttrs}
                        onChange={(e) => setPAttrs(e.target.value)}
                      />
                      <div className="md:col-span-6">
                        <BomEditor
                          allProducts={productsForAzienda}
                          items={bomItems}
                          onChange={setBomItems}
                        />
                      </div>
                      <button
                        className="bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90 md:col-span-2"
                        type="submit"
                      >
                        Crea prodotto
                      </button>
                    </form>
                  </SectionCard>

                  <SectionCard title={`Elenco Prodotti (${productsForAzienda.length})`}>
                    {productsForAzienda.length === 0 ? (
                      <EmptyState title="Nessun prodotto" />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2 pr-4">Prodotto</th>
                              <th className="py-2 pr-4">Type</th>
                              <th className="py-2 pr-4">Stato</th>
                              <th className="py-2 pr-4">On-chain</th>
                              <th className="py-2 pr-4">Azioni</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(productsForAzienda as any[]).map((p: any) => (
                              <tr key={p.productId || p.id} className="border-t border-border/60">
                                <td className="py-2 pr-4">{p.name || p.productName}</td>
                                <td className="py-2 pr-4">{p.productTypeId || p.typeId}</td>
                                <td className="py-2 pr-4">{p.status || "-"}</td>
                                <td className="py-2 pr-4">
                                  {p.onChain?.hash ? (
                                    <div className="text-xs">
                                      <div>
                                        <strong>hash:</strong> <code>{p.onChain.hash.slice(0, 16)}…</code>
                                      </div>
                                      <div>
                                        <strong>at:</strong> {p.onChain.anchoredAt}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </td>
                                <td className="py-2 pr-4 space-x-2">
                                  <button
                                    className="border border-border rounded px-3 py-1 hover:bg-muted"
                                    onClick={() => setEditProduct(p)}
                                  >
                                    Dettagli
                                  </button>
                                  <button
                                    className="border border-border rounded px-3 py-1 hover:bg-muted disabled:opacity-50"
                                    disabled={anchorBusy === p.id}
                                    onClick={() => anchorProductOnChain(p)}
                                  >
                                    {anchorBusy === p.id ? "Ancoraggio…" : "Ancoraggio on-chain"}
                                  </button>
                                  <button
                                    className="border border-red-400 text-red-600 rounded px-3 py-1 hover:bg-red-500/10"
                                    onClick={() => removeProduct?.(p.productId || p.id)}
                                  >
                                    Elimina
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>

                  {editProduct && (
                    <SectionCard title="Dettagli Prodotto">
                      <ProductEditor
                        value={editProduct}
                        onCancel={() => setEditProduct(null)}
                        onSave={(v) => {
                          updateProduct?.(v);
                          setEditProduct(null);
                        }}
                      />
                    </SectionCard>
                  )}
                </div>
              )}

              {/* ASSIGNMENTS */}
              {tab === "assignments" && (
                <div className="space-y-6">
                  <SectionCard
                    title="Crea Assegnazioni"
                    subtitle={`Consumo ${eventCost} credito/i`}
                  >
                    <form onSubmit={createAssignments} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        className="border border-border rounded px-3 py-2 md:col-span-3"
                        placeholder="Product IDs (csv)"
                        value={asProductIdsCsv}
                        onChange={(e) => setAsProductIdsCsv(e.target.value)}
                      />
                      <select
                        className="border border-border rounded px-3 py-2"
                        value={asPriority}
                        onChange={(e) => setAsPriority(e.target.value as any)}
                      >
                        <option value="low">Priorità: low</option>
                        <option value="medium">Priorità: medium</option>
                        <option value="high">Priorità: high</option>
                      </select>
                      <select
                        className="border border-border rounded px-3 py-2"
                        value={asOperatorDid}
                        onChange={(e) => setAsOperatorDid(e.target.value)}
                      >
                        <option value="">Operatore (opz.)</option>
                        {operators.map((o: any) => (
                          <option key={o.id} value={o.id}>
                            {o.name || o.id}
                          </option>
                        ))}
                      </select>
                      <select
                        className="border border-border rounded px-3 py-2"
                        value={asMachineDid}
                        onChange={(e) => setAsMachineDid(e.target.value)}
                      >
                        <option value="">Macchinario (opz.)</option>
                        {machines.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.name || m.id}
                          </option>
                        ))}
                      </select>
                      <input
                        className="border border-border rounded px-3 py-2 md:col-span-3"
                        placeholder="Istruzioni (opzionali)"
                        value={asInstructions}
                        onChange={(e) => setAsInstructions(e.target.value)}
                      />
                      <input
                        className="border border-border rounded px-3 py-2 md:col-span-3"
                        placeholder="Messaggio/Note"
                        value={asMessage}
                        onChange={(e) => setAsMessage(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Costo</label>
                        <input
                          type="number"
                          className="border border-border rounded px-2 py-1 w-24"
                          value={eventCost}
                          onChange={(e) => setEventCost(Number(e.target.value))}
                        />
                      </div>
                      <button
                        className="bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90 md:col-span-3"
                        type="submit"
                      >
                        Crea
                      </button>
                    </form>
                  </SectionCard>

                  <SectionCard title="Eventi recenti">
                    {(events || []).length === 0 ? (
                      <EmptyState title="Nessun evento." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2 pr-4">Quando</th>
                              <th className="py-2 pr-4">Kind</th>
                              <th className="py-2 pr-4">Prodotto</th>
                              <th className="py-2 pr-4">Operatore</th>
                              <th className="py-2 pr-4">Macchina</th>
                              <th className="py-2 pr-4">Messaggio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(events || [])
                              .slice()
                              .sort((a: any, b: any) =>
                                String(b?.createdAt || "").localeCompare(String(a?.createdAt || ""))
                              )
                              .map((ev: any, idx: number) => (
                                <tr key={ev.id || idx} className="border-t border-border/60">
                                  <td className="py-2 pr-4">{ev.createdAt || "-"}</td>
                                  <td className="py-2 pr-4">{ev.kind || ev.type || "-"}</td>
                                  <td className="py-2 pr-4">{ev.productId || "-"}</td>
                                  <td className="py-2 pr-4">
                                    <code className="text-xs">{ev.assignedOperatorDid || ev.actorDid || "-"}</code>
                                  </td>
                                  <td className="py-2 pr-4">
                                    <code className="text-xs">{ev.assignedMachineDid || ev.machineDid || "-"}</code>
                                  </td>
                                  <td className="py-2 pr-4">{ev.message || "-"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* COMPOSER VC/DPP */}
              {tab === "compose" && (
                <div className="space-y-6">
                  <SectionCard title="Composizione & Pubblicazione VC/DPP">
                    <form onSubmit={composeAndPublishVC} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Prodotto</label>
                        <select
                          className="w-full border border-border rounded px-3 py-2"
                          value={selectedProductId}
                          onChange={(e) => {
                            const pid = e.target.value;
                            setSelectedProductId(pid);
                            const prod = (productsForAzienda as any[]).find(
                              (p) => (p.productId || p.id) === pid
                            );
                            if (prod?.typeId || prod?.productTypeId)
                              setSelectedTypeId(prod.typeId || prod.productTypeId);
                          }}
                        >
                          <option value="">Seleziona…</option>
                          {(productsForAzienda as any[]).map((p: any) => (
                            <option key={p.productId || p.id} value={p.productId || p.id}>
                              {p.name || p.productName || "-"} ({p.productId || p.id})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Product Type</label>
                        <select
                          className="w-full border border-border rounded px-3 py-2"
                          value={selectedTypeId}
                          onChange={(e) => setSelectedTypeId(e.target.value)}
                        >
                          <option value="">Seleziona…</option>
                          {(typesForAzienda as any[]).map((t: any) => (
                            <option key={t.id} value={t.id}>
                              {t.name} v{t.version}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-muted-foreground mb-1">
                          Payload VC (JSON, esclusi proof & eventHistory)
                        </label>
                        <textarea
                          className="w-full border border-border rounded px-3 py-2 min-h-[140px]"
                          value={payloadData}
                          onChange={(e) => setPayloadData(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">
                          Costo pubblicazione (crediti)
                        </label>
                        <input
                          type="number"
                          className="w-full border border-border rounded px-3 py-2"
                          value={publishCost}
                          onChange={(e) => setPublishCost(Number(e.target.value))}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <button
                          className="bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90"
                          type="submit"
                        >
                          Pubblica VC/DPP
                        </button>
                      </div>
                    </form>
                  </SectionCard>

                  <SectionCard title={`Le tue VC/DPP (${myVCs.length})`}>
                    {myVCs.length === 0 ? (
                      <EmptyState title="Nessuna VC pubblicata." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2 pr-4">ID</th>
                              <th className="py-2 pr-4">Prodotto</th>
                              <th className="py-2 pr-4">Versione</th>
                              <th className="py-2 pr-4">Stato</th>
                              <th className="py-2 pr-4">Verify</th>
                              <th className="py-2 pr-4">Azioni</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myVCs.map((v: any) => (
                              <tr key={v.id || v["@id"]} className="border-t border-border/60">
                                <td className="py-2 pr-4">
                                  <code className="text-xs break-all">{v.id || v["@id"]}</code>
                                </td>
                                <td className="py-2 pr-4">
                                  {v?.credentialSubject?.product?.name ||
                                    v?.credentialSubject?.product?.id ||
                                    "-"}
                                </td>
                                <td className="py-2 pr-4">{v.version || "-"}</td>
                                <td className="py-2 pr-4 capitalize">{v.status || "-"}</td>
                                <td className="py-2 pr-4">
                                  <VerifyFlag vc={v} />
                                </td>
                                <td className="py-2 pr-4 space-x-2">
                                  <button
                                    className="border border-border rounded px-3 py-1 hover:bg-muted"
                                    onClick={() => bumpMinor(v.id || v["@id"])}
                                  >
                                    Bump minor
                                  </button>
                                  <button
                                    className="border border-red-400 text-red-600 rounded px-3 py-1 hover:bg-red-500/10"
                                    onClick={() => revokeVC(v.id || v["@id"])}
                                  >
                                    Revoca
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* VC LIST (Archivio) */}
              {tab === "vcs" && (
                <div className="space-y-6">
                  <SectionCard title="VC/DPP Pubblicate">
                    {myVCs.length === 0 ? (
                      <EmptyState title="Nessuna VC/DPP." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-2 pr-4">ID</th>
                              <th className="py-2 pr-4">Prodotto</th>
                              <th className="py-2 pr-4">Versione</th>
                              <th className="py-2 pr-4">Stato</th>
                              <th className="py-2 pr-4">Verify</th>
                              <th className="py-2 pr-4">Azioni</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myVCs.map((v: any) => (
                              <tr key={v.id || v["@id"]} className="border-t border-border/60">
                                <td className="py-2 pr-4">
                                  <code className="text-xs break-all">{v.id || v["@id"]}</code>
                                </td>
                                <td className="py-2 pr-4">
                                  {v?.credentialSubject?.product?.name ||
                                    v?.credentialSubject?.product?.id ||
                                    "-"}
                                </td>
                                <td className="py-2 pr-4">{v.version || "-"}</td>
                                <td className="py-2 pr-4 capitalize">{v.status || "-"}</td>
                                <td className="py-2 pr-4">
                                  <VerifyFlag vc={v} />
                                </td>
                                <td className="py-2 pr-4 space-x-2">
                                  <button
                                    className="border border-border rounded px-3 py-1 hover:bg-muted"
                                    onClick={() => bumpMinor(v.id || v["@id"])}
                                  >
                                    Bump minor
                                  </button>
                                  <button
                                    className="border border-red-400 text-red-600 rounded px-3 py-1 hover:bg-red-500/10"
                                    onClick={() => revokeVC(v.id || v["@id"])}
                                  >
                                    Revoca
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* JSON CENTER (placeholder) */}
              {tab === "json" && (
                <div className="space-y-6">
                  <SectionCard title="JSON Center">
                    <p className="text-muted-foreground">
                      In arrivo: dataset Products, Events, VC/DPP con filtri e quick-verify.
                    </p>
                  </SectionCard>
                </div>
              )}
            </main>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ----------------------- Editor Type ----------------------- */
function TypeEditor({
  value,
  onSave,
  onCancel,
}: {
  value: any;
  onSave: (v: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(value.name || "");
  const [version, setVersion] = useState(value.version || "1.0.0");
  const [policy, setPolicy] = useState(value.policy || "");
  const [attrs, setAttrs] = useState<string>((value.attributes || []).join(", "));
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...value,
      name: name.trim(),
      version: version.trim() || "1.0.0",
      policy: policy.trim(),
      attributes: attrs.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <input className="border border-border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border border-border rounded px-3 py-2" value={version} onChange={(e) => setVersion(e.target.value)} />
      <input className="border border-border rounded px-3 py-2 md:col-span-2" value={policy} onChange={(e) => setPolicy(e.target.value)} />
      <input className="border border-border rounded px-3 py-2 md:col-span-4" value={attrs} onChange={(e) => setAttrs(e.target.value)} />
      <div className="md:col-span-4 flex gap-2">
        <button className="border border-border rounded px-3 py-1 hover:bg-muted" type="submit">
          Salva
        </button>
        <button className="border border-border rounded px-3 py-1" type="button" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </form>
  );
}

/* ----------------------- Editor BOM ----------------------- */
function BomEditor({
  allProducts,
  items,
  onChange,
}: {
  allProducts: any[];
  items: { componentId: string; qty: number }[];
  onChange: (v: { componentId: string; qty: number }[]) => void;
}) {
  const [compId, setCompId] = useState("");
  const [qty, setQty] = useState<number>(1);

  const add = () => {
    if (!compId || qty <= 0) return;
    onChange([...(items || []), { componentId: compId, qty }]);
    setCompId("");
    setQty(1);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="font-medium mb-2">BOM (distinta base)</div>
      <div className="flex gap-2 items-center mb-3">
        <select
          className="border border-border rounded px-3 py-2"
          value={compId}
          onChange={(e) => setCompId(e.target.value)}
        >
          <option value="">Componente…</option>
          {(allProducts || []).map((p: any) => (
            <option key={p.productId || p.id} value={p.productId || p.id}>
              {p.name || p.productName} ({p.productId || p.id})
            </option>
          ))}
        </select>
        <input
          type="number"
          className="border border-border rounded px-3 py-2 w-28"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        />
        <button type="button" className="border border-border rounded px-3 py-2 hover:bg-muted" onClick={add}>
          Aggiungi
        </button>
      </div>

      {!items || items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessun componente in BOM.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Component ID</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={`${it.componentId}-${idx}`} className="border-t border-border/60">
                  <td className="py-2 pr-4">
                    <code className="text-xs break-all">{it.componentId}</code>
                  </td>
                  <td className="py-2 pr-4">{it.qty}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      className="border border-red-400 text-red-600 rounded px-3 py-1 hover:bg-red-500/10"
                      onClick={() => remove(idx)}
                    >
                      Rimuovi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ----------------------- Editor Prodotto ----------------------- */
function ProductEditor({
  value,
  onSave,
  onCancel,
}: {
  value: any;
  onSave: (v: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(value.name || value.productName || "");
  const [status, setStatus] = useState(value.status || "draft");
  const [attrs, setAttrs] = useState<string>(() => {
    const obj = value.attributes || {};
    return Object.keys(obj)
      .map((k) => `${k}=${obj[k]}`)
      .join(", ");
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed: Record<string, string> = {};
    (attrs || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [k, ...rest] = pair.split("=");
        parsed[k] = rest.join("=") || "";
      });
    onSave({
      ...value,
      name,
      productName: name,
      status,
      attributes: parsed,
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input className="border border-border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      <select className="border border-border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="draft">draft</option>
        <option value="active">active</option>
        <option value="anchored">anchored</option>
        <option value="archived">archived</option>
      </select>
      <input className="border border-border rounded px-3 py-2 md:col-span-3" value={attrs} onChange={(e) => setAttrs(e.target.value)} />
      <div className="md:col-span-3 flex gap-2">
        <button className="border border-border rounded px-3 py-1 hover:bg-muted" type="submit">
          Salva
        </button>
        <button className="border border-border rounded px-3 py-1" type="button" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </form>
  );
}
