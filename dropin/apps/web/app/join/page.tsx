
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const router = useRouter();
  return (
    <div className="max-w-md space-y-3">
      <h2 className="text-xl font-semibold">Join a Game</h2>
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter Game ID" className="w-full border rounded p-2" />
      <button onClick={()=> router.push(`/play/${code}`)} className="px-3 py-2 border rounded">Join</button>
    </div>
  );
}
