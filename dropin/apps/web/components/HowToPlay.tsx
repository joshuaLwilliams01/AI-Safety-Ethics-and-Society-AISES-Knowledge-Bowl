
"use client";
import { useState } from "react";
import { useSound } from "./SoundProvider";

export default function HowToPlay() {
  const [open, setOpen] = useState(false);
  const { play } = useSound();
  return (
    <>
      <button onClick={() => { setOpen(true); play("click"); }} className="px-3 py-2 border rounded">How to Play</button>
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/60 grid place-items-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl p-6 space-y-3">
            <h3 className="text-xl font-semibold">How to Play</h3>
            <p><strong>Goal:</strong> Be the champion by earning the highest score.</p>
            <p>Answers must be phrased as questions (e.g., “What is …?” “Who are …?”).</p>
            <p>Gather one host and three players (or pair off). Determine who has “control of the board.”</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Player with control picks a category and dollar amount.</li>
              <li>When reading finishes, players buzz. First buzz answers within 10s.</li>
              <li>Wrong or timeout: subtract the value; others may buzz.</li>
              <li>Correct: add the value and choose the next clue.</li>
              <li>Play continues until the board is cleared.</li>
            </ul>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setOpen(false); play("click"); }} className="px-3 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
