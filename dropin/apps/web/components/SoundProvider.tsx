
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SoundMap = { intro?: HTMLAudioElement; click?: HTMLAudioElement; buzzer?: HTMLAudioElement; timesup?: HTMLAudioElement; };

const SoundCtx = createContext<{ enabled: boolean; setEnabled: (v: boolean) => void; sounds: SoundMap; play: (name: keyof SoundMap) => void; }>({
  enabled: true, setEnabled: () => {}, sounds: {}, play: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const sounds = useMemo<SoundMap>(() => ({
    intro: new Audio("/sounds/intro.mp3"),
    click: new Audio("/sounds/click.mp3"),
    buzzer: new Audio("/sounds/buzzer.mp3"),
    timesup: new Audio("/sounds/timesup.mp3"),
  }), []);

  useEffect(() => { if (sounds.intro) sounds.intro.loop = true; }, [sounds]);
  const play = (name: keyof SoundMap) => { const a = sounds[name]; if (!a) return; if (!enabled) return; a.currentTime = 0; a.play().catch(() => {}); };
  return (<SoundCtx.Provider value={{ enabled, setEnabled, sounds, play }}>{children}</SoundCtx.Provider>);
}
export const useSound = () => useContext(SoundCtx);
