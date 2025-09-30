
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

type Clue = { value:number|string; prompt:string; answer:string; explainer?:string; ref?:string; };
type Category = { name:string; clues:Clue[] };
type Game = { id:string; categories:Category[] };

export default function HostConsole({ params }: { params: { id: string }}) {
  const [game, setGame] = useState<Game | null>(null);
  const [current, setCurrent] = useState<{categoryIndex:number; value:number|string; revealed:boolean} | null>(null);
  const [time, setTime] = useState(0);
  const [armed, setArmed] = useState(false);
  const sockRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/${params.id}`);
      if (r.ok) setGame(await r.json());
    })();
    const s = io(process.env.NEXT_PUBLIC_API_URL!, { transports:["websocket"] });
    sockRef.current = s;
    s.emit("room:join", { gameId: params.id, role: "host", name: "Host" });
    s.on("clue:open", setCurrent);
    s.on("clue:reveal", setCurrent);
    return () => { s.disconnect(); };
  }, [params.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (current && !current.revealed) {
          sockRef.current?.emit("timer:done", { gameId: params.id });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, params.id]);

  const openClue = (ci:number, value:number|string) => {
    setArmed(true);
    setTime(10);
    sockRef.current?.emit("clue:open", { gameId: params.id, categoryIndex: ci, value });
  };

  useEffect(() => {
    if (!armed) return;
    if (time <= 0 && current && !current.revealed) {
      sockRef.current?.emit("timer:done", { gameId: params.id });
      setArmed(false);
      return;
    }
    const t = setTimeout(() => setTime((x)=>x-1), 1000);
    return () => clearTimeout(t);
  }, [armed, time, current, params.id]);

  const promptText = useMemo(() => {
    if (!game || !current) return null;
    const cat = game.categories[current.categoryIndex];
    const c = cat.clues.find(x => String(x.value) === String(current.value));
    return c || null;
  }, [game, current]);

  if (!game) return <div>Loading…</div>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="grid grid-cols-6 gap-2">
          {game.categories.map((c, ci) => (
            <div key={ci} className="flex flex-col gap-2">
              <div className="font-semibold text-center bg-blue-900 text-white p-2 rounded">{c.name}</div>
              {c.clues.map((cl) => (
                <button key={String(cl.value)} onClick={()=>openClue(ci, cl.value)}
                        className="h-14 bg-blue-600 text-white rounded text-xl font-bold">
                  ${cl.value}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="border rounded p-3">
          <div className="text-sm opacity-70">Timer</div>
          <div className="text-3xl font-bold">{Math.max(time,0)}s</div>
          <div className="text-xs mt-1">Spacebar reveals Answer/Explainer early</div>
        </div>
        <button onClick={()=>location.reload()} className="px-3 py-2 border rounded">Reset Game</button>
      </div>

      {promptText && (
        <div className="fixed inset-0 bg-black/70 grid place-items-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full space-y-3">
            <div className="text-sm font-mono opacity-60">Value: ${String(promptText.value)}</div>
            <h3 className="text-2xl font-semibold">{promptText.prompt}</h3>
            {current?.revealed ? (
              <div className="space-y-2">
                <div className="text-green-700 font-semibold">Answer: {promptText.answer}</div>
                {promptText.explainer && <p className="opacity-80">{promptText.explainer}</p>}
              </div>
            ) : (
              <p className="italic opacity-60">Answer hidden until timer ends or spacebar is pressed.</p>
            )}
            <div className="flex justify-end">
              <button onClick={()=> setCurrent(null)} className="px-3 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
