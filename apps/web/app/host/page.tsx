"use client";
import { useState } from "react";

export default function Host() {
  const [id, setId] = useState<string | null>(null);
  const create = async () => {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games`, { method:"POST" });
    if (!r.ok) { alert("API not reachable. Is it running on :4000?"); return; }
    const j = await r.json(); setId(j.id);
  };
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Host</h2>
      <button onClick={create} className="px-3 py-2 border rounded">Create Game</button>
      {id && <div>Game ID: <code>{id}</code></div>}
    </div>
  );
}
