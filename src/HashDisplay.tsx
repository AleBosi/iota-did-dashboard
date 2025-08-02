import React, { useEffect, useState } from "react";
import { sha256, deterministicStringify } from "./utilsVC";

export default function HashDisplay({ vc }: { vc: any }) {
  const [calc, setCalc] = useState("");
  useEffect(() => {
    (async () => {
      const { proof, ...data } = vc;
      const h = await sha256(deterministicStringify(data));
      setCalc(h);
    })();
  }, [vc]);
  return (
    <span
      className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded-lg max-w-[220px] overflow-x-auto whitespace-nowrap block"
      style={{ fontSize: 13, lineHeight: 1.5 }}
    >
      {calc}
    </span>
  );
}
