
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import { nanoid } from "nanoid";

const app = express();
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

type Clue = { value: number|string; prompt: string; answer: string; explainer?: string; ref?: string; };
type Category = { name: string; clues: Clue[] };
type Game = { id: string; categories: Category[]; createdAt: number };

const GAMES = new Map<string, Game>();

function sampleGame(): Game {
  return {
    id: nanoid(8).toUpperCase(),
    createdAt: Date.now(),
    categories: [
      { name: "AI Fundamentals", clues: [
        { value:100, prompt:"Computer systems that perform tasks associated with human intelligence, and the data‑driven subfield that learns patterns rather than hand‑coded rules.", answer:"What are artificial intelligence and machine learning?" },
        { value:200, prompt:"AI built to perform a specific task within a narrow domain (e.g., translation, routing, or game play).", answer:"What is narrow AI?" },
        { value:300, prompt:"AI that can learn and perform a wide range of tasks across many domains, beyond any single specialty.", answer:"What is artificial general intelligence (AGI)?" },
        { value:400, prompt:"AI that can perform approximately every task as well as human workers.", answer:"What is human‑level AI (HLAI)?" },
        { value:500, prompt:"From 2009–2024, the training compute used for notable language models did this on average each year.", answer:"What is quadrupled (4× per year)?" },
      ]},
      { name: "Catastrophic Risks", clues: [
        { value:100, prompt:"The umbrella risk where bad or reckless actors weaponize AI to cause harm.", answer:"What is malicious use?" },
        { value:200, prompt:"AI lowering barriers to design/synthesize dangerous pathogens and chemicals.", answer:"What is AI‑enabled bioterrorism / engineered pandemics?" },
        { value:300, prompt:"Turning powerful systems into autonomous agents that pursue open‑ended goals.", answer:"What is unleashing rogue AI agents?" },
        { value:400, prompt:"Tailored, large‑scale manipulation that erodes a shared reality and public trust.", answer:"What are persuasive AIs?" },
        { value:500, prompt:"Top‑down misuse that uses AI for surveillance, censorship, and lock‑in.", answer:"What is concentration of power?" },
      ]},
    ]
  };
}

app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.post("/games", (_req, res) => {
  const game = sampleGame();
  GAMES.set(game.id, game);
  res.json({ id: game.id });
});

app.get("/games/:id", (req, res) => {
  const g = GAMES.get(req.params.id);
  if (!g) return res.status(404).json({ error: "Not found" });
  res.json(g);
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || "http://localhost:3000" } });

type RoomState = {
  locked: boolean;
  current?: { categoryIndex: number; value: number|string; revealed: boolean; };
  scores: Record<string, number>;
};

const ROOMS = new Map<string, RoomState>();

io.on("connection", (socket) => {
  socket.on("room:join", ({ gameId, role, name }) => {
    socket.join(gameId);
    (socket as any).meta = { gameId, role, name };
    if(!ROOMS.has(gameId)) ROOMS.set(gameId, { locked:false, scores:{} });
    io.to(gameId).emit("room:state", ROOMS.get(gameId));
  });

  socket.on("clue:open", ({ gameId, categoryIndex, value }) => {
    const st = ROOMS.get(gameId); if (!st) return;
    st.locked = false;
    st.current = { categoryIndex, value, revealed: false };
    io.to(gameId).emit("clue:open", st.current);
  });

  socket.on("buzz", () => {
    const meta = (socket as any).meta || {};
    const gameId = meta.gameId; if (!gameId) return;
    const st = ROOMS.get(gameId); if (!st || st.locked === true) return;
    st.locked = true;
    io.to(gameId).emit("lock", { winner: meta.name || socket.id, at: Date.now() });
  });

  socket.on("timer:done", ({ gameId }) => {
    const st = ROOMS.get(gameId); if (!st || !st.current) return;
    st.current.revealed = true;
    io.to(gameId).emit("clue:reveal", st.current);
  });
});

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
