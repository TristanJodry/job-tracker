import React, { useState } from "react";
import { Database, User } from "../types";
import { Users, UserPlus, Trash2, Shield, ShieldAlert, Key } from "lucide-react";

interface AdminPanelProps {
  db: Database;
  onUpdate: (db: Database) => void;
}

export default function AdminPanel({ db, onUpdate }: AdminPanelProps) {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      password: newPassword,
      role: newRole,
      geminiApiKey: ""
    };

    onUpdate({ ...db, users: [...db.users, newUser] });
    setNewUsername("");
    setNewPassword("");
    alert(`Utilisateur ${newUsername} créé !`);
  };

  const updateUserField = (id: string, field: keyof User, value: any) => {
    onUpdate({
      ...db,
      users: db.users.map(u => u.id === id ? { ...u, [field]: value } : u)
    });
  };

  const deleteUser = (id: string) => {
    if (id === "admin-1") return alert("Impossible de supprimer l'administrateur principal.");
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      onUpdate({
        ...db,
        users: db.users.filter(u => u.id !== id),
        profiles: db.profiles.filter(p => p.userId !== id),
        applications: db.applications.filter(a => a.userId !== id)
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Administration</h2>
        <p className="text-slate-500 mt-1">Gérez les comptes utilisateurs et les accès à l'application.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Ajouter un utilisateur */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-50 pb-4 mb-6">
            <UserPlus className="text-blue-600" size={20} />
            <h3>Créer un compte</h3>
          </div>
          
          <form onSubmit={addUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Identifiant</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mot de passe</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rôle</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
              >
                <option value="user">Utilisateur standard</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              Ajouter
            </button>
          </form>
        </section>

        {/* Liste des utilisateurs */}
        <section className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-50 pb-4 mb-6">
            <Users className="text-blue-600" size={20} />
            <h3>Utilisateurs enregistrés ({db.users.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-4 px-2">Utilisateur</th>
                  <th className="pb-4 px-2">Rôle</th>
                  <th className="pb-4 px-2">Clé Gemini (User)</th>
                  <th className="pb-4 px-2">Mot de passe</th>
                  <th className="pb-4 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {db.users.map((u) => (
                  <tr key={u.id} className="group">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <select
                        className="text-xs font-bold px-2 py-1 rounded bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500"
                        value={u.role}
                        onChange={(e) => updateUserField(u.id, "role", e.target.value)}
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-4 px-2">
                      <input
                        type="password"
                        placeholder="sk-..."
                        className="text-xs border border-slate-100 rounded px-2 py-1 w-32 focus:border-blue-300 outline-none"
                        value={u.geminiApiKey || ""}
                        onChange={(e) => updateUserField(u.id, "geminiApiKey", e.target.value)}
                      />
                    </td>
                    <td className="py-4 px-2">
                      <input
                        type="password"
                        placeholder="Changer..."
                        className="text-xs border border-slate-100 rounded px-2 py-1 w-24 focus:border-blue-300 outline-none"
                        onChange={(e) => updateUserField(u.id, "password", e.target.value)}
                      />
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => deleteUser(u.id)}
                          className={`p-2 transition-all rounded-lg ${
                            u.id === "admin-1" 
                            ? "text-slate-100 cursor-not-allowed" 
                            : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                          }`}
                          disabled={u.id === "admin-1"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
