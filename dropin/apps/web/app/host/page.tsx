
"use client";
import { useState } from "react";

export default function HostPage() {
  const [id, setId] = useState<string | null>(null);
  const create = async () => {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games`, { method:"POST" });
    const j = await r.json(); setId(j.id);
  };
  return (
    <div className="space-y-3">
      <button onClick={create} className="px-3 py-2 border rounded">Create Game</button>
      {id && <div>Game ID: <code className="font-mono">{id}</code> — open <a className="underline" href={`/host/${id}`}>Host Console</a></div>}
    </div>
  );
}
