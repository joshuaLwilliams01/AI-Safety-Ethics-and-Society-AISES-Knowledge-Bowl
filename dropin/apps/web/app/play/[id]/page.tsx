
"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export default function Player({ params }: { params: { id: string }}) {
  const [winner, setWinner] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_API_URL!, { transports:["websocket"] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const join = () => {
    if (!socket) return;
    socket.emit("room:join", { gameId: params.id, role: "player", name });
    socket.on("lock", (msg:any) => setWinner(msg.winner));
    setJoined(true);
  };

  const buzz = () => socket?.emit("buzz");

  return (
    <div className="max-w-md mx-auto space-y-4 text-center">
      {!joined ? (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Join {params.id}</h2>
          <input className="w-full border rounded p-2" placeholder="Your team/name" value={name} onChange={e=>setName(e.target.value)} />
          <button onClick={join} className="px-3 py-2 border rounded">Join</button>
        </div>
      ) : (
        <>
          <button onClick={buzz} className="w-full h-48 rounded-xl text-2xl font-bold text-white" style={{ background:"#2563eb" }}>Buzz</button>
          {winner && <div>{winner === name ? "You got it!" : `${winner} won the buzz`}</div>}
        </>
      )}
    </div>
  );
}
