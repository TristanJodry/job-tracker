import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const DB_PATH = path.join(process.cwd(), "db.json");

async function readDB() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // AI Route
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { prompt, userApiKey } = req.body;
      // Use user's key if provided, else system key
      const apiKey = userApiKey || process.env.GEMINI_API_KEY || "";
      
      const genAI = new GoogleGenAI({ apiKey });
      const interaction = await genAI.interactions.create({
        model: "gemini-3.8-flash",
        input: prompt,
      });
      
      let fullOutput = "";
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const textContent = step.content?.find(c => (c as any).type === 'text');
          if (textContent && (textContent as any).text) {
            fullOutput += (textContent as any).text;
          }
        }
      }
      res.json({ text: fullOutput });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DB API Routes
  app.get("/api/db", async (req, res) => {
    try {
      const db = await readDB();
      // Remove passwords before sending to client
      const safeUsers = db.users.map((u: any) => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
      res.json({ ...db, users: safeUsers });
    } catch (error) {
      res.status(500).json({ error: "Failed to read database" });
    }
  });

  // Login Route with bcrypt
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const db = await readDB();
      const user = db.users.find((u: any) => u.username === username);
      
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const { password, ...safeUser } = user;
          return res.json({ user: safeUser });
        }
      }
      res.status(401).json({ error: "Identifiants incorrects" });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/db/update", async (req, res) => {
    try {
      const db = await readDB();
      const newDb = req.body;

      // Handle password hashing for new/updated users
      for (const newUser of newDb.users) {
        const oldUser = db.users.find((u: any) => u.id === newUser.id);
        
        // If password was provided (not empty) and is different from old hashed password, hash it
        if (newUser.password && (!oldUser || newUser.password !== oldUser.password)) {
          if (!newUser.password.startsWith("$2b$")) { // Simple check if already hashed
            newUser.password = await bcrypt.hash(newUser.password, 10);
          }
        } else if (oldUser && !newUser.password) {
          // Keep old password if none provided
          newUser.password = oldUser.password;
        }
      }

      await writeDB(newDb);
      res.json({ success: true });
    } catch (error) {
      console.error("Update DB error:", error);
      res.status(500).json({ error: "Failed to write database" });
    }
  });

  // Job Search Route (Real-time web search using Gemini Search Grounding)
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const { q, l, userApiKey } = req.query;
      const query = (q as string) || "Développeur";
      const location = (l as string) || "France";
      
      const apiKey = (userApiKey as string) || process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        return res.status(400).json({ error: "Clé API Gemini manquante pour la recherche." });
      }

      const genAI = new GoogleGenAI({ apiKey });
      
      const prompt = `Trouve moi 10 offres d'emploi réelles et très récentes pour le poste suivant: "${query}" à "${location}".
      Pour chaque offre, je veux: le titre exact, l'entreprise, la ville précise, la source (LinkedIn, HelloWork, Indeed, etc.) et l'URL directe de l'offre.
      Réponds UNIQUEMENT sous forme d'un tableau JSON d'objets avec les clés: id, title, company, location, source, url.`;

      const interaction = await genAI.interactions.create({
        model: "gemini-3.8-flash",
        input: prompt,
        tools: [{ type: 'google_search' }],
      });

      let fullOutput = "";
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const textContent = step.content?.find(c => (c as any).type === 'text');
          if (textContent && (textContent as any).text) {
            fullOutput += (textContent as any).text;
          }
        }
      }

      const jsonMatch = fullOutput.match(/\[[\s\S]*\]/);
      const jobs = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      const formattedResults = jobs.map((j: any) => ({
        id: j.id || `job-${Math.random().toString(36).substr(2, 9)}`,
        title: j.title,
        company: { display_name: j.company },
        location: { display_name: j.location },
        source: j.source,
        redirect_url: j.url
      }));

      res.json({ results: formattedResults, type: "live" });
    } catch (error: any) {
      console.error("Real Job Search Error:", error);
      
      // Fallback for RateLimit or other API issues
      const { q, l } = req.query;
      const query = (q as string) || "Développeur";
      const location = (l as string) || "France";
      const sources = ["LinkedIn", "HelloWork", "Indeed", "Welcome to the Jungle"];
      const companies = ["TechCorp", "Innovated", "Digital Services", "Future Soft", "Global Solutions"];

      const fallbackResults = Array.from({ length: 8 }).map((_, i) => ({
        id: `fb-${Math.random().toString(36).substr(2, 9)}`,
        title: `${query} ${["H/F", "Confirmé", "Junior", "Senior"][i % 4]}`,
        company: { display_name: companies[i % companies.length] },
        location: { display_name: location },
        source: sources[i % sources.length],
        redirect_url: "#"
      }));

      res.json({ 
        results: fallbackResults, 
        type: "fallback", 
        message: error.status === 429 ? "Quota API atteint. Affichage de résultats suggérés." : "Erreur de connexion. Affichage de résultats suggérés." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
