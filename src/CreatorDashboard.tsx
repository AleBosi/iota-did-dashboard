import React, { useState, useEffect } from "react";
import CreatorSidebar from "./CreatorSidebar";
import TypeForm from "./components/TypeForm";
import AddNodeModal from "./components/AddNodeModal";
import PermModal from "./components/PermModal";
import EventModal from "./components/EventModal";
import BomTreeview from "./BomTreeview";

// Importa i gestori delle anagrafiche
import GestioneMacchinari from "./anagrafiche/macchinari/GestioneMacchinari";
import GestioneOperatori from "./anagrafiche/operatori/GestioneOperatori";

// ==== TIPI BASE ====
type TableColumn = { id: string; label: string; type: "text" | "number" | "date" };
type ProductField = {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "table";
  options?: string[];
  columns?: TableColumn[];
};
type EventField = {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "table";
  options?: string[];
  columns?: TableColumn[];
};
type ProductType = {
  id: string;
  name: string;
  fields: ProductField[];
  eventFields: EventField[];
};
type Member = {
  did: string;
  name?: string;
  matricola?: string;
  role: "Operatore" | "Macchinario" | "Creator";
};
type Company = {
  companyDid: string;
  companyName: string;
  members: Member[];
};
type NodeEvent = {
  id: string;
  date: string;
  descr: string;
};
type ProductNode = {
  id: string;
  name: string;
  parentId?: string;
  typeId: string;
  typeName: string;
  fieldValues: { [fieldId: string]: any };
  allowedMembers: string[];
  events: NodeEvent[];
  children?: ProductNode[];
};

// --- FUNZIONI DI UTILITÀ ---
function genId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
function ensureChildren(nodes: ProductNode[] = []): ProductNode[] {
  return Array.isArray(nodes)
    ? nodes.map(n => ({
        ...n,
        children: Array.isArray(n.children) ? ensureChildren(n.children) : [],
      }))
    : [];
}
function loadTypes(companyDid: string): ProductType[] {
  try { return JSON.parse(localStorage.getItem(`creator_types_${companyDid}`) || "[]"); } catch { return []; }
}
function saveTypes(companyDid: string, arr: ProductType[]) {
  localStorage.setItem(`creator_types_${companyDid}`, JSON.stringify(arr));
}
function loadBOM(companyDid: string): ProductNode[] {
  try { return JSON.parse(localStorage.getItem(`creator_bom_${companyDid}`) || "[]"); } catch { return []; }
}
function saveBOM(companyDid: string, arr: ProductNode[]) {
  localStorage.setItem(`creator_bom_${companyDid}`, JSON.stringify(arr));
}
function flattenNodes(nodes: ProductNode[]): ProductNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.reduce<ProductNode[]>(
    (arr, n) => arr.concat([n], n.children ? flattenNodes(n.children) : []),
    []
  );
}
function getParentPath(tree: ProductNode[], id?: string, types?: ProductType[]): string {
  if (!id) return "";
  let path: string[] = [];
  function search(nodes: ProductNode[]): boolean {
    for (let n of nodes) {
      if (n.id === id) {
        path.unshift(n.name);
        const typeName = types?.find(t => t.id === n.typeId)?.name || n.typeName;
        path.unshift(typeName);
        return true;
      }
      if (n.children && search(n.children)) {
        path.unshift(n.name);
        return true;
      }
    }
    return false;
  }
  search(tree);
  return path.join(" - ");
}
function batchAttach(tree: ProductNode[], parentId: string | undefined, nodesToAdd: ProductNode[]): ProductNode[] {
  if (!parentId) return [...tree, ...nodesToAdd];
  return tree.map(n =>
    n.id === parentId
      ? { ...n, children: Array.isArray(n.children) ? [...n.children, ...nodesToAdd] : [...nodesToAdd] }
      : { ...n, children: Array.isArray(n.children) ? batchAttach(n.children, parentId, nodesToAdd) : [] }
  );
}

// ==== COMPONENTE PRINCIPALE ====
export default function CreatorDashboard({
  azienda,
  creator,
  logout
}: {
  azienda: Company;
  creator: Member;
  logout: () => void;
}) {
  // Sidebar state: aggiungi tutte le voci disponibili
  const [page, setPage] = useState<"bom" | "tipologie" | "macchinari" | "operatori">("bom");

  // Stato BOM/Tipologie come prima
  const [types, setTypes] = useState<ProductType[]>(() => loadTypes(azienda.companyDid));
  const [bom, setBOM] = useState<ProductNode[]>(() => ensureChildren(loadBOM(azienda.companyDid)));
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Modali aggiunta/permessi/eventi
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [newNodeParentId, setNewNodeParentId] = useState<string | undefined>(undefined);
  const [permNodeIds, setPermNodeIds] = useState<string[]>([]);
  const [showPermModal, setShowPermModal] = useState(false);
  const [eventNodeIds, setEventNodeIds] = useState<string[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);

  // Operatori/macchine abilitabili
  const allowedMembers = azienda.members.filter(m => m.role !== "Creator");

  useEffect(() => { saveTypes(azienda.companyDid, types); }, [types, azienda.companyDid]);
  useEffect(() => { saveBOM(azienda.companyDid, bom); }, [bom, azienda.companyDid]);

  // --- CRUD tipologia ---
  function handleAddType() {
    setEditingType({ id: genId(), name: "", fields: [], eventFields: [] });
    setShowForm(true);
  }
  function handleEditType(t: ProductType) {
    setEditingType({ ...t, fields: [...t.fields], eventFields: [...t.eventFields] });
    setShowForm(true);
  }
  function handleDeleteType(id: string) {
    if (window.confirm("Sicuro di voler eliminare questa tipologia?")) setTypes(types.filter(t => t.id !== id));
  }
  function handleSaveType(type: ProductType) {
    if (!type.name.trim()) return alert("Nome tipologia obbligatorio.");
    if (editingType && types.find(t => t.id === type.id)) {
      setTypes(types.map(t => (t.id === type.id ? type : t)));
    } else {
      setTypes([...types, type]);
    }
    setShowForm(false);
    setEditingType(null);
  }

  // === NUOVA GESTIONE AGGIUNTA MULTIPLA (modale con struttura e tipologia root)
  function handleAddNodeBatch(nodes: any[], parentId?: string, selectedTypeId?: string) {
    function tempToProductNode(node: any): ProductNode {
      let typeId = selectedTypeId;
      let typeName = types.find(t => t.id === typeId)?.name || "";
      if (parentId) {
        const parentNode = flattenNodes(bom).find(x => x.id === parentId);
        typeId = parentNode?.typeId;
        typeName = parentNode?.typeName;
      }
      return {
        id: genId(),
        name: node.name,
        parentId: parentId,
        typeId: typeId || "",
        typeName: typeName || "",
        fieldValues: {},
        allowedMembers: [],
        events: [],
        children: node.children.map(tempToProductNode)
      };
    }
    const productNodes = nodes.map(tempToProductNode);
    setBOM((prev) => {
      const updated = batchAttach(prev, parentId, productNodes);
      saveBOM(azienda.companyDid, updated);
      return updated;
    });
    setShowNodeForm(false);
    setNewNodeParentId(undefined);
  }

  // --- BOM: AGGIUNTA NODO STANDARD (SINGOLO) ---
  function openNodeForm(parentId?: string) {
    setNewNodeParentId(parentId);
    setShowNodeForm(true);
  }

  // --- Gestione permessi/eventi ---
  function handleDeleteSelected(ids: string[]) {
    if (!window.confirm("Eliminare tutti i selezionati?")) return;
    updateAndSaveBOM(removeNodes(bom, new Set(ids)));
  }
  function removeNodes(tree: ProductNode[], removeSet: Set<string>): ProductNode[] {
    return tree.filter(n => !removeSet.has(n.id)).map(n =>
      ({ ...n, children: Array.isArray(n.children) ? removeNodes(n.children, removeSet) : [] })
    );
  }
  function handlePerms(ids: string[]) {
    setPermNodeIds(ids);
    setShowPermModal(true);
  }
  function handleSavePerms(nodeIds: string[], allowed: string[]) {
    updateAndSaveBOM(applyPermsToTree(bom, new Set(nodeIds), allowed));
    setShowPermModal(false);
    setPermNodeIds([]);
  }
  function applyPermsToTree(tree: ProductNode[], nodeIds: Set<string>, allowed: string[]): ProductNode[] {
    return tree.map(n =>
      nodeIds.has(n.id)
        ? { ...n, allowedMembers: [...allowed] }
        : { ...n, children: Array.isArray(n.children) ? applyPermsToTree(n.children, nodeIds, allowed) : [] }
    );
  }
  function handleEvents(ids: string[]) {
    setEventNodeIds(ids);
    setShowEventModal(true);
  }
  function handleAddEvents(nodeIds: string[], event: NodeEvent) {
    updateAndSaveBOM(addEventToTree(bom, new Set(nodeIds), event));
    setShowEventModal(false);
    setEventNodeIds([]);
  }
  function addEventToTree(tree: ProductNode[], nodeIds: Set<string>, event: NodeEvent): ProductNode[] {
    return tree.map(n =>
      nodeIds.has(n.id)
        ? { ...n, events: [...(n.events || []), event] }
        : { ...n, children: Array.isArray(n.children) ? addEventToTree(n.children, nodeIds, event) : [] }
    );
  }

  // Helper: ogni update salva e normalizza BOM!
  function updateAndSaveBOM(newBom: ProductNode[]) {
    const fixedBom = ensureChildren(newBom);
    setBOM(fixedBom);
    saveBOM(azienda.companyDid, fixedBom);
  }

  // --- UI ---
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar sinistra */}
      <CreatorSidebar page={page} setPage={setPage} onLogout={logout} />

      {/* Main content */}
      <div className="ml-72 flex-1 py-8 px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-1">
                Creator Dashboard
              </h1>
              <div className="text-base text-gray-500 mb-1">
                Azienda: <b>{azienda.companyName}</b> (<span className="font-mono">{azienda.companyDid}</span>)
              </div>
              <div className="text-base text-blue-700">
                Creator: <b>{creator.name}</b> <span className="font-mono text-sm ml-2">{creator.did}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-700 hover:bg-red-800 text-white rounded-xl px-5 py-2 text-lg font-bold"
            >
              Logout
            </button>
          </div>

          {/* --- Contenuto dinamico --- */}
          {page === "bom" && (
            <>
              <button
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-bold mb-4"
                onClick={() => openNodeForm(undefined)}
              >+ Aggiungi prodotto/macchinario radice</button>
              <BomTreeview
                bom={bom}
                members={allowedMembers}
                onDelete={handleDeleteSelected}
                onPerms={handlePerms}
                onEvents={handleEvents}
                onAddChild={openNodeForm}
              />
            </>
          )}

          {page === "tipologie" && (
            <>
              <div className="mb-8 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-800">Tipologie prodotto configurabili</h2>
                  <button
                    onClick={handleAddType}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-bold"
                  >+ Nuova tipologia</button>
                </div>
                {types.length === 0 && (
                  <div className="text-gray-500 mb-4">Nessuna tipologia ancora configurata.</div>
                )}
                <ul className="space-y-4">
                  {types.map(t => (
                    <li key={t.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                        <div className="text-lg font-bold text-blue-800">{t.name}</div>
                        <div>
                          <button
                            className="bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold px-4 py-1.5 rounded-md mr-2"
                            onClick={() => handleEditType(t)}
                          >Modifica</button>
                          <button
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-1.5 rounded-md"
                            onClick={() => handleDeleteType(t.id)}
                          >Elimina</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                          <b>Caratteristiche prodotto:</b>
                          <ul className="mt-1">
                            {t.fields.length === 0 && (
                              <li className="text-gray-400 italic">Nessuna</li>
                            )}
                            {t.fields.map(f => (
                              <li key={f.id}>
                                {f.label}
                                <span className="ml-1 text-xs text-gray-400">[{f.type}]</span>
                                {f.type === "table" && f.columns &&
                                  <span className="ml-2 text-gray-500">colonne: {f.columns.map(col => col.label).join(", ")}</span>
                                }
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <b>Campi evento:</b>
                          <ul className="mt-1">
                            {t.eventFields.length === 0 && (
                              <li className="text-gray-400 italic">Nessuno</li>
                            )}
                            {t.eventFields.map(f => (
                              <li key={f.id}>
                                {f.label}
                                <span className="ml-1 text-xs text-gray-400">[{f.type}]</span>
                                {f.type === "table" && f.columns &&
                                  <span className="ml-2 text-gray-500">colonne: {f.columns.map(col => col.label).join(", ")}</span>
                                }
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {page === "macchinari" && (
            <GestioneMacchinari />
          )}

          {page === "operatori" && (
            <GestioneOperatori />
          )}

          {/* --- MODALI --- */}
          {showForm && (
            <TypeForm
              type={editingType}
              onSave={handleSaveType}
              onCancel={() => { setShowForm(false); setEditingType(null); }}
            />
          )}
          {showNodeForm && (
            <AddNodeModal
              parentPath={getParentPath(bom, newNodeParentId, types)}
              types={!newNodeParentId ? types : undefined}
              parentTypeId={newNodeParentId ? (flattenNodes(bom).find(n => n.id === newNodeParentId)?.typeId) : undefined}
              onConfirm={(nodes, selectedTypeId) => handleAddNodeBatch(nodes, newNodeParentId, selectedTypeId)}
              onCancel={() => { setShowNodeForm(false); setNewNodeParentId(undefined); }}
            />
          )}
          {showPermModal && (
            <PermModal
              nodeIds={permNodeIds}
              members={allowedMembers}
              bom={bom}
              onSave={handleSavePerms}
              onCancel={() => setShowPermModal(false)}
            />
          )}
          {showEventModal && (
            <EventModal
              nodeIds={eventNodeIds}
              types={types}
              onSave={handleAddEvents}
              onCancel={() => setShowEventModal(false)}
              bom={bom}
            />
          )}
        </div>
      </div>
    </div>
  );
}
