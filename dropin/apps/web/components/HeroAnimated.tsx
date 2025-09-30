
"use client";
import { useEffect, useState } from "react";
import { useSound } from "./SoundProvider";

export default function HeroAnimated() {
  const { enabled, setEnabled, sounds, play } = useSound();
  const [started, setStarted] = useState(false);
  const startIntro = () => { setStarted(true); play("click"); sounds.intro?.play().catch(() => {}); };
  useEffect(() => { if (!enabled) sounds.intro?.pause(); else if (started) sounds.intro?.play().catch(()=>{}); }, [enabled, started, sounds]);
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-10 text-white">
      <div className="absolute inset-0 opacity-30" style={{background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.12), transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.08), transparent 35%)"}} />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-wide">AISES Knowledge Bowl</h2>
        <p className="opacity-90 max-w-2xl">Buzz fast, answer in question-form, and top the leaderboard.</p>
        <div className="flex gap-3 mt-2">
          {!started && (<button onClick={startIntro} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border">Start Experience</button>)}
          <button onClick={() => setEnabled(!enabled)} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border">{enabled ? "Sound: On" : "Sound: Off"}</button>
        </div>
      </div>
    </div>
  );
}
