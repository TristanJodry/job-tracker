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
  const PORT = process.env.PORT || 3000;

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

  // Job Search Route (using Adzuna or similar)
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const { q, l, r } = req.query;
      // For demonstration, we use a more realistic mock data if no real API key is provided
      // In a real scenario, you'd use fetch(`https://api.adzuna.com/v1/api/jobs/fr/search/1?app_id=${ID}&app_key=${KEY}&what=${q}&where=${l}&distance=${r}`)
      
      const mockedJobs = [
        {
          id: "adz-" + Math.random().toString(36).substr(2, 9),
          title: (q as string) || "Développeur Web",
          company: { display_name: "Tech Solutions France" },
          location: { display_name: (l as string) || "Paris" },
          description: "Nous recherchons un profil dynamique pour rejoindre notre équipe...",
          redirect_url: "https://www.adzuna.fr/details/12345",
          created: new Date().toISOString(),
          salary_min: 35000,
          salary_max: 45000
        },
        {
          id: "adz-" + Math.random().toString(36).substr(2, 9),
          title: (q as string) || "Ingénieur Logiciel",
          company: { display_name: "InnovCorp" },
          location: { display_name: (l as string) || "Lyon" },
          description: "Expert en React et Node.js ? Ce poste est pour vous !",
          redirect_url: "https://www.adzuna.fr/details/67890",
          created: new Date().toISOString(),
          salary_min: 40000,
          salary_max: 55000
        }
      ];

      res.json({ results: mockedJobs });
    } catch (error) {
      res.status(500).json({ error: "Job search failed" });
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
