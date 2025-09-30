import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import { nanoid } from "nanoid";

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

type Clue = { value: number|string; prompt: string; answer: string };
type Category = { name: string; clues: Clue[] };
type Game = { 
  id: string; 
  categories: Category[]; 
  createdAt: number;
  status: 'waiting' | 'in-progress' | 'finished';
  currentQuestion?: { category: string; clue: Clue };
  players: string[];
  scores: Record<string, number>;
};

const GAMES = new Map<string, Game>();

function sampleGame(): Game {
  return {
    id: nanoid(8).toUpperCase(),
    createdAt: Date.now(),
    status: 'waiting',
    players: [],
    scores: {},
    categories: [
      { name: "AI Fundamentals", clues: [
        { value:100, prompt:"Computer systems that perform tasks associated with human intelligence.", answer:"What is artificial intelligence?" },
        { value:200, prompt:"Data-driven approach that learns patterns, not rules.", answer:"What is machine learning?" }
      ]},
      { name: "Catastrophic Risks", clues: [
        { value:100, prompt:"Umbrella risk where bad actors weaponize AI.", answer:"What is malicious use?" },
        { value:200, prompt:"AI-enabled bioterrorism / engineered pandemics.", answer:"What is AI-enabled bioterrorism?" }
      ]}
    ]
  };
}

app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.post("/games", (_req, res) => { 
  const g = sampleGame(); 
  GAMES.set(g.id, g); 
  res.json({ id: g.id }); 
});

app.get("/games/:id", (req, res) => { 
  const g = GAMES.get(req.params.id); 
  if (!g) return res.status(404).json({ error: "Not found" }); 
  res.json(g); 
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || "http://localhost:3000" } });

io.on("connection", (socket) => {
  socket.on("room:join", ({ gameId, role, name }) => {
    const game = GAMES.get(gameId);
    
    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    // FIXED: Don't reset game when new players join
    socket.join(gameId);
    socket.data = { gameId, role, name };
    
    // Add player to existing game without resetting
    if (!game.players.includes(name || socket.id)) {
      game.players.push(name || socket.id);
      game.scores[name || socket.id] = 0;
    }

    // Emit current game state to all players
    io.to(gameId).emit("room:state", { 
      joined: name || socket.id,
      game: {
        id: game.id,
        status: game.status,
        players: game.players,
        scores: game.scores,
        currentQuestion: game.currentQuestion
      }
    });
  });

  socket.on("game:start", ({ gameId }) => {
    const game = GAMES.get(gameId);
    if (game && game.status === 'waiting') {
      game.status = 'in-progress';
      io.to(gameId).emit("game:started", { game });
    }
  });

  socket.on("game:select-question", ({ gameId, category, clue }) => {
    const game = GAMES.get(gameId);
    if (game && game.status === 'in-progress') {
      game.currentQuestion = { category, clue };
      io.to(gameId).emit("question:selected", { category, clue });
    }
  });

  socket.on("game:answer", ({ gameId, playerId, answer }) => {
    const game = GAMES.get(gameId);
    if (game && game.status === 'in-progress') {
      // Handle scoring logic here
      io.to(gameId).emit("answer:submitted", { playerId, answer });
    }
  });
});

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
