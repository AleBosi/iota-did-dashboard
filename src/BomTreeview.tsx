import React, { useState, useEffect } from "react";

// Tipi base
type Member = { did: string; name?: string; matricola?: string; role: string };
type NodeEvent = { id: string; date: string; descr: string };
type ProductNode = {
  id: string;
  name: string;
  typeName: string;
  allowedMembers: string[];
  events: NodeEvent[];
  children?: ProductNode[];
};

function ensureChildren(nodes: ProductNode[] = []): ProductNode[] {
  return Array.isArray(nodes)
    ? nodes.map(n => ({
        ...n,
        children: Array.isArray(n.children) ? ensureChildren(n.children) : [],
      }))
    : [];
}

interface BomTreeviewProps {
  bom: ProductNode[];
  members: Member[];
  onDelete: (ids: string[]) => void;
  onPerms: (ids: string[]) => void;
  onEvents: (ids: string[]) => void;
  onAddChild: (parentId?: string) => void; // NEW!
}

export default function BomTreeview({ bom, members, onDelete, onPerms, onEvents, onAddChild }: BomTreeviewProps) {
  const [fixedBom, setFixedBom] = useState<ProductNode[]>(() => ensureChildren(bom));
  useEffect(() => { setFixedBom(ensureChildren(bom)); }, [bom]);

  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});

  // Raggruppa per tipologia
  const byType: { [type: string]: ProductNode[] } = {};
  fixedBom.forEach(node => {
    if (!byType[node.typeName]) byType[node.typeName] = [];
    byType[node.typeName].push(node);
  });

  function toggleSelect(id: string, node?: ProductNode, selectChildren?: boolean) {
    let ids = [...selected];
    if (ids.includes(id)) {
      ids = ids.filter(x => x !== id);
      if (selectChildren && Array.isArray(node?.children))
        ids = ids.filter(x => !allChildIds(node).includes(x));
    } else {
      ids.push(id);
      if (selectChildren && Array.isArray(node?.children))
        ids = ids.concat(allChildIds(node));
    }
    setSelected(Array.from(new Set(ids)));
  }
  function deselectAll() { setSelected([]); }
  function allChildIds(node?: ProductNode): string[] {
    if (!node || !Array.isArray(node.children)) return [];
    return node.children.reduce<string[]>(
      (arr, n) => arr.concat(n.id, ...allChildIds(n)),
      []
    );
  }

  function renderTree(nodes: ProductNode[], level = 0) {
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    return (
      <ul className={level === 0 ? "mb-6" : "ml-6 border-l-2 border-blue-200"}>
        {safeNodes.map(node => {
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          const isExpanded = expanded[node.id] !== false;
          const isSelected = selected.includes(node.id);
          const fontClass = node.allowedMembers.length > 0 ? "text-gray-900" : "text-gray-500";
          return (
            <li key={node.id} className="mb-2">
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button
                    className="text-blue-600 font-bold"
                    onClick={() => setExpanded(exp => ({ ...exp, [node.id]: !isExpanded }))}
                  >{isExpanded ? "▼" : "▶"}</button>
                )}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(node.id, node, true)}
                  className="mr-1"
                />
                <span className={`${fontClass} transition-colors duration-200`}>
                  {node.name}
                </span>
                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{node.typeName}</span>
                {/* --- NUOVO: Bottone sotto-componente --- */}
                <button
                  className="ml-2 text-green-700 text-xs border border-green-600 px-2 py-0.5 rounded hover:bg-green-50"
                  title="Aggiungi sotto-componente"
                  onClick={() => onAddChild(node.id)}
                >+ Sotto-componente</button>
              </div>
              {node.allowedMembers.length > 0 && (
                <div className="ml-8 mt-1 flex gap-2 flex-wrap">
                  {node.allowedMembers.map(did => {
                    const m = members.find(m => m.did === did);
                    return (
                      <span key={did} className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                        {m?.name || m?.matricola || did}
                        <span className="ml-1 text-xs text-blue-300">({m?.role})</span>
                      </span>
                    );
                  })}
                </div>
              )}
              {node.events.length > 0 && (
                <div className="ml-8 mt-1 flex gap-2 flex-wrap">
                  {node.events.map(ev => (
                    <span key={ev.id} className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs">
                      {ev.date}: {ev.descr}
                    </span>
                  ))}
                </div>
              )}
              {hasChildren && isExpanded && renderTree(Array.isArray(node.children) ? node.children : [], level + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-4xl mx-auto">
      {/* Barra azioni */}
      <div className="flex items-center gap-3 mb-6 sticky top-0 z-10 bg-white">
        <button
          className="bg-red-600 text-white font-bold px-4 py-2 rounded disabled:opacity-60"
          onClick={() => onDelete(selected)}
          disabled={selected.length === 0}
        >Elimina selezionati</button>
        <button
          className="bg-blue-700 text-white font-bold px-4 py-2 rounded disabled:opacity-60"
          onClick={() => onPerms(selected)}
          disabled={selected.length === 0}
        >Gestisci permessi</button>
        <button
          className="bg-green-600 text-white font-bold px-4 py-2 rounded disabled:opacity-60"
          onClick={() => onEvents(selected)}
          disabled={selected.length === 0}
        >Aggiungi evento</button>
        <button
          className="bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded"
          onClick={deselectAll}
        >Deseleziona tutti</button>
        <span className="ml-4 text-gray-400 text-sm">
          {selected.length > 0 ? `${selected.length} selezionati` : ""}
        </span>
      </div>
      {/* Treeview per tipologia */}
      {Object.entries(byType).map(([type, nodes]) => (
        <div key={type} className="mb-7">
          <div className="text-lg font-bold text-blue-700 mb-2">{type}</div>
          {renderTree(nodes)}
        </div>
      ))}
    </div>
  );
}
