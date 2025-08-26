import { useEffect, useState } from "react";
import { verifyVc } from "../../services/vc";

export default function VerifyFlag({ vc }: { vc: any }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => setOk(await verifyVc(vc)))();
  }, [vc]);
  if (ok === null) return <span className="text-gray-500">…</span>;
  return ok ? <span className="text-green-600">✅</span> : <span className="text-red-600">❌</span>;
}
