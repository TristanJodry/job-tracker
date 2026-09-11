import React, { useState } from "react";
import { User } from "../types";
import { LogIn, UserCircle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export default function Login({ users, onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        onLogin(data.user);
      } else {
        const data = await res.json();
        setError(data.error || "Identifiants incorrects");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <UserCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Job Tracker</h2>
          <p className="mt-2 text-slate-500">Connectez-vous pour gérer vos candidatures</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="admin ou utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <LogIn size={20} />
            Se connecter
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Comptes de test : admin/admin ou tout nouvel utilisateur créé par l'admin.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
