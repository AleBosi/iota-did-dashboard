import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TempNode = {
  id: string;
  name: string;
  children: TempNode[];
};

// NEW: props estesi per gestire anche la tipologia in creazione root
export default function AddNodeModal({
  parentPath,
  onConfirm,
  onCancel,
  types,
  parentTypeId,
}: {
  parentPath: string;
  onConfirm: (tree: TempNode[], selectedTypeId?: string) => void;
  onCancel: () => void;
  types?: { id: string; name: string }[];
  parentTypeId?: string; // passato solo per figli
}) {
  const [tree, setTree] = useState<TempNode[]>([]);
  const [editMap, setEditMap] = useState<{ [id: string]: boolean }>({});
  const [newRootName, setNewRootName] = useState("");
  // Se radice, consenti scelta tipologia!
  const [selectedType, setSelectedType] = useState(types && types.length > 0 ? types[0].id : "");

  const sensors = useSensors(useSensor(PointerSensor));

  function handleAddRoot() {
    if (!newRootName.trim()) return;
    setTree([...tree, { id: genId(), name: newRootName, children: [] }]);
    setNewRootName("");
  }
  function handleAddChild(parentId: string) {
    setTree(addChildToTree(tree, parentId));
  }
  function addChildToTree(nodes: TempNode[], parentId: string): TempNode[] {
    return nodes.map(n =>
      n.id === parentId
        ? { ...n, children: [...n.children, { id: genId(), name: "Nuovo componente", children: [] }] }
        : { ...n, children: addChildToTree(n.children, parentId) }
    );
  }
  function handleEditNode(id: string, name: string) {
    setTree(updateNodeName(tree, id, name));
    setEditMap(e => ({ ...e, [id]: false }));
  }
  function updateNodeName(nodes: TempNode[], id: string, name: string): TempNode[] {
    return nodes.map(n =>
      n.id === id ? { ...n, name } : { ...n, children: updateNodeName(n.children, id, name) }
    );
  }
  function handleRemoveNode(id: string) {
    setTree(removeNode(tree, id));
  }
  function removeNode(nodes: TempNode[], id: string): TempNode[] {
    return nodes
      .filter(n => n.id !== id)
      .map(n => ({ ...n, children: removeNode(n.children, id) }));
  }
  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTree(tree => arrayMove(tree, tree.findIndex(n => n.id === active.id), tree.findIndex(n => n.id === over.id)));
  }
  function renderNodes(nodes: TempNode[], parentPath: string = "") {
    return (
      <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
        {nodes.map(node => (
          <SortableNode
            key={node.id}
            node={node}
            path={parentPath}
            onEdit={name => handleEditNode(node.id, name)}
            onEditStart={() => setEditMap(e => ({ ...e, [node.id]: true }))}
            editing={!!editMap[node.id]}
            onRemove={() => handleRemoveNode(node.id)}
            onAddChild={() => handleAddChild(node.id)}
            renderChildren={() => node.children.length > 0 ? renderNodes(node.children, pathLabel(parentPath, node.name)) : null}
          />
        ))}
      </SortableContext>
    );
  }
  function pathLabel(parentPath: string, name: string) {
    return parentPath ? `${parentPath} - ${name}` : name;
  }

  // --- Render
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-7 rounded-xl w-full max-w-2xl shadow-lg">
        <div className="font-bold text-lg mb-1">Aggiungi sotto-struttura</div>
        <div className="text-gray-600 mb-3 italic">{parentPath}</div>
        {/* Radice: mostra select tipologia, SOTTOcomponenti: mostra solo testo */}
        {!parentTypeId && types && types.length > 0 && (
          <div className="mb-3">
            <label className="block mb-1 font-semibold">Tipologia prodotto:</label>
            <select
              className="border rounded px-2 py-1 w-full font-bold"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
        {/* Input nuovo nodo radice */}
        <div className="mb-3 flex gap-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            placeholder="Nome nuovo componente/membro radice"
            value={newRootName}
            onChange={e => setNewRootName(e.target.value)}
            onKeyDown={e => (e.key === "Enter" ? handleAddRoot() : undefined)}
          />
          <button
            className="bg-green-700 text-white font-bold px-3 py-1 rounded"
            onClick={handleAddRoot}
          >+ Nuovo</button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div>
            {tree.length === 0 && <div className="text-gray-400 italic mb-3">Nessun componente aggiunto.</div>}
            {renderNodes(tree, parentPath)}
          </div>
        </DndContext>
        <div className="flex justify-end gap-3 mt-7">
          <button
            className="bg-green-700 text-white font-bold px-5 py-2 rounded"
            onClick={() => onConfirm(tree, !parentTypeId ? selectedType : undefined)}
            disabled={tree.length === 0 || (!parentTypeId && !selectedType)}
          >
            Salva struttura
          </button>
          <button
            className="bg-gray-200 text-gray-700 font-bold px-5 py-2 rounded"
            onClick={onCancel}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Singolo nodo ---
function SortableNode({
  node,
  path,
  onEdit,
  onEditStart,
  editing,
  onRemove,
  onAddChild,
  renderChildren,
}: {
  node: TempNode;
  path: string;
  onEdit: (name: string) => void;
  onEditStart: () => void;
  editing: boolean;
  onRemove: () => void;
  onAddChild: () => void;
  renderChildren: () => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f0f7ff" : undefined,
  };
  const [temp, setTemp] = useState(node.name);

  React.useEffect(() => { setTemp(node.name); }, [node.name, editing]);

  return (
    <div ref={setNodeRef} style={style} className="mb-1 pl-1">
      <div className="flex items-center gap-2">
        <span {...attributes} {...listeners} className="cursor-move text-blue-400 select-none pr-1">☰</span>
        {editing ? (
          <input
            className="border-b border-blue-300 bg-blue-50 px-1 py-0.5 rounded w-44 mr-2"
            value={temp}
            autoFocus
            onChange={e => setTemp(e.target.value)}
            onBlur={() => onEdit(temp)}
            onKeyDown={e => {
              if (e.key === "Enter") onEdit(temp);
              if (e.key === "Escape") onEdit(node.name);
            }}
          />
        ) : (
          <span
            className="font-bold cursor-pointer hover:underline w-44 truncate"
            title={node.name}
            onClick={onEditStart}
          >{node.name}</span>
        )}
        <button className="text-xs text-green-700 font-bold ml-1" onClick={onAddChild}>+ Sotto-componente</button>
        <button className="text-xs text-red-600 font-bold ml-1" onClick={onRemove}>Elimina</button>
      </div>
      <div className="ml-8">
        {renderChildren && renderChildren()}
      </div>
    </div>
  );
}

function genId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
