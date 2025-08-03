import React, { useState } from "react";

interface Props {
  credits: number;
  onBuyCredits?: (qty: number) => void;
}

export default function CreditsDashboard({ credits, onBuyCredits }: Props) {
  const [buyQty, setBuyQty] = useState(0);

  return (
    <div className="border rounded p-4 bg-gray-50 mb-4">
      <div className="mb-2">
        <b>Crediti disponibili:</b> <span className="text-xl">{credits}</span>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min={1}
          value={buyQty}
          onChange={e => setBuyQty(parseInt(e.target.value) || 0)}
          className="border px-2 py-1 rounded w-20"
          placeholder="Crediti"
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          disabled={buyQty <= 0}
          onClick={() => onBuyCredits && onBuyCredits(buyQty)}
        >
          Acquista
        </button>
      </div>
    </div>
  );
}
