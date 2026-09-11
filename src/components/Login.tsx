import React, { useState } from "react";
import { User } from "../types";
import { LogIn, UserCircle, ShieldCheck, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Login({ users, onLogin, isDarkMode, onToggleDarkMode }: LoginProps) {
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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <button 
        onClick={onToggleDarkMode}
        className={`absolute top-8 right-8 p-3 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100'} shadow-lg`}
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-md w-full space-y-8 p-10 rounded-2xl shadow-xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
      >
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <UserCircle size={40} />
          </div>
          <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Job Tracker</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Connectez-vous pour gérer vos candidatures</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Nom d'utilisateur</label>
              <input
                type="text"
                required
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500' : 'bg-white border-slate-200 focus:ring-blue-500'}`}
                placeholder="admin ou utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Mot de passe</label>
              <input
                type="password"
                required
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500' : 'bg-white border-slate-200 focus:ring-blue-500'}`}
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
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold transition-all active:scale-95 shadow-lg ${isDarkMode ? 'shadow-blue-900/20' : 'shadow-blue-200'}`}
          >
            <LogIn size={20} />
            Se connecter
          </button>
        </form>

        <div className={`pt-6 border-t text-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Comptes de test : admin/admin ou tout nouvel utilisateur créé par l'admin.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
