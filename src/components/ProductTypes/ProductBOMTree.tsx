import React from "react";
import { ProductType } from "../../models/productType";

interface Props {
  productType: ProductType;
}

export default function ProductBOMTree({ productType }: Props) {
  const renderBOMNode = (node: any, level: number = 0) => {
    const indent = "  ".repeat(level);
    
    return (
      <div key={node.id || node.name} className="mb-2">
        <div className={`flex items-center p-2 rounded ${level === 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <span className="font-mono text-sm text-gray-500 mr-2">{indent}</span>
          <div className="flex-1">
            <span className="font-medium">{node.name}</span>
            {node.quantity && (
              <span className="ml-2 text-sm text-gray-600">({node.quantity})</span>
            )}
            {node.description && (
              <div className="text-sm text-gray-500 mt-1">{node.description}</div>
            )}
          </div>
          {node.type && (
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
              {node.type}
            </span>
          )}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-4 mt-2">
            {node.children.map((child: any) => renderBOMNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Bill of Materials (BOM)</h4>
        <span className="text-sm text-gray-500">
          Versione: {productType.version || "1.0"}
        </span>
      </div>
      
      {productType.bomTree && productType.bomTree.length > 0 ? (
        <div className="border border-gray-200 rounded-lg p-4">
          {productType.bomTree.map((node) => renderBOMNode(node))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          <p>Nessun BOM Tree definito per questo tipo di prodotto</p>
          <p className="text-sm mt-1">Aggiungi componenti e materiali per creare la struttura</p>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        <p>Il BOM Tree mostra la struttura gerarchica dei componenti e materiali necessari per la produzione.</p>
      </div>
    </div>
  );
}

