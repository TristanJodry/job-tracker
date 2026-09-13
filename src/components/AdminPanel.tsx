import React, { useState } from "react";
import { Database, User, UserRole } from "../types";
import { Users, UserPlus, Trash2, Shield, ShieldAlert, Key, Check, Eye, EyeOff, Lock, Sparkles, CheckCircle2 } from "lucide-react";

interface AdminPanelProps {
  db: Database;
  currentUser?: User;
  onUpdate: (db: Database) => void | Promise<void>;
}

interface UserDraft {
  role: UserRole;
  geminiApiKey: string;
  newPassword: string;
}

export default function AdminPanel({ db, currentUser, onUpdate }: AdminPanelProps) {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [newGeminiKey, setNewGeminiKey] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creationMessage, setCreationMessage] = useState<string | null>(null);

  // Per-row editing state
  const [edits, setEdits] = useState<Record<string, UserDraft>>({});
  const [showRowPassword, setShowRowPassword] = useState<Record<string, boolean>>({});
  const [showRowApiKey, setShowRowApiKey] = useState<Record<string, boolean>>({});
  const [savedRow, setSavedRow] = useState<Record<string, boolean>>({});
  const [savingRow, setSavingRow] = useState<Record<string, boolean>>({});

  const getDraft = (u: User): UserDraft => {
    return (
      edits[u.id] || {
        role: u.role,
        geminiApiKey: u.geminiApiKey || "",
        newPassword: "",
      }
    );
  };

  const updateDraftField = (userId: string, field: keyof UserDraft, value: any, originalUser: User) => {
    const current = getDraft(originalUser);
    setEdits({
      ...edits,
      [userId]: {
        ...current,
        [field]: value,
      },
    });
  };

  const handleSaveUser = async (userId: string) => {
    const originalUser = db.users.find((u) => u.id === userId);
    if (!originalUser) return;

    const draft = getDraft(originalUser);
    setSavingRow((prev) => ({ ...prev, [userId]: true }));

    const updatedUsers = db.users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          role: draft.role,
          geminiApiKey: draft.geminiApiKey.trim(),
          ...(draft.newPassword.trim() ? { password: draft.newPassword.trim() } : {}),
        };
      }
      return u;
    });

    try {
      await onUpdate({
        ...db,
        users: updatedUsers,
      });

      // Clear password draft upon save
      setEdits((prev) => ({
        ...prev,
        [userId]: {
          ...draft,
          newPassword: "",
        },
      }));

      setSavedRow((prev) => ({ ...prev, [userId]: true }));
      setTimeout(() => {
        setSavedRow((prev) => ({ ...prev, [userId]: false }));
      }, 3000);
    } catch (err) {
      console.error("Erreur d'enregistrement", err);
      alert("Erreur lors de la mise à jour de l'utilisateur.");
    } finally {
      setSavingRow((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    if (db.users.some((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert("Un utilisateur avec cet identifiant existe déjà.");
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole,
      geminiApiKey: newGeminiKey.trim(),
    };

    await onUpdate({ ...db, users: [...db.users, newUser] });
    setNewUsername("");
    setNewPassword("");
    setNewGeminiKey("");
    setNewRole("user");
    setCreationMessage(`Compte "${newUser.username}" (${newUser.role === "admin" ? "Administrateur" : "Utilisateur"}) créé avec succès !`);
    setTimeout(() => setCreationMessage(null), 4000);
  };

  const deleteUser = (id: string) => {
    if (id === "admin-1") return alert("Impossible de supprimer l'administrateur principal.");
    if (currentUser && id === currentUser.id) return alert("Vous ne pouvez pas supprimer votre propre compte connecté.");
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur et ses candidatures associées ?")) {
      onUpdate({
        ...db,
        users: db.users.filter((u) => u.id !== id),
        profiles: db.profiles.filter((p) => p.userId !== id),
        applications: db.applications.filter((a) => a.userId !== id),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight dark:text-white">Administration</h2>
        <p className="text-slate-500 mt-1 dark:text-slate-400">
          Gérez les comptes utilisateurs, promouvez des administrateurs et configurez les clés d'accès.
        </p>
      </div>

      {creationMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{creationMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Ajouter un utilisateur */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit lg:col-span-1 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-2 font-bold border-b border-slate-100 pb-4 mb-6 dark:text-white dark:border-slate-700">
            <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
            <h3>Créer un compte</h3>
          </div>

          <form onSubmit={addUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                Identifiant
              </label>
              <input
                type="text"
                required
                placeholder="Ex: jean.dupont"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Mot de passe"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                Rôle
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
              >
                <option value="user">Utilisateur standard</option>
                <option value="admin">Administrateur (+ onglet Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                Clé Gemini API (Optionnel)
              </label>
              <input
                type="password"
                placeholder="AIzaSy... (optionnel)"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={newGeminiKey}
                onChange={(e) => setNewGeminiKey(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-sm dark:shadow-blue-900/20 cursor-pointer"
            >
              <UserPlus size={18} />
              Créer l'utilisateur
            </button>
          </form>
        </section>

        {/* Liste des utilisateurs */}
        <section className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold dark:text-white">
              <Users className="text-blue-600 dark:text-blue-400" size={20} />
              <h3>Utilisateurs enregistrés ({db.users.length})</h3>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Shield size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Pour valider un mot de passe ou une clé, cliquez sur <strong>Confirmer</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-4 px-2">Utilisateur</th>
                  <th className="pb-4 px-2">Rôle d'accès</th>
                  <th className="pb-4 px-2">Clé API Gemini</th>
                  <th className="pb-4 px-2">Nouveau mot de passe</th>
                  <th className="pb-4 px-2 text-right">Confirmation & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {db.users.map((u) => {
                  const draft = getDraft(u);
                  const isSelf = currentUser && currentUser.id === u.id;
                  const hasPasswordChange = Boolean(draft.newPassword.trim());
                  const hasKeyChange = draft.geminiApiKey !== (u.geminiApiKey || "");
                  const hasRoleChange = draft.role !== u.role;
                  const hasChanges = hasPasswordChange || hasKeyChange || hasRoleChange;
                  const isSaved = savedRow[u.id];
                  const isSaving = savingRow[u.id];

                  return (
                    <tr key={u.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                      {/* Nom d'utilisateur */}
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            u.role === "admin"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}>
                            {u.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-sm dark:text-white">{u.username}</span>
                              {isSelf && (
                                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded dark:bg-slate-700 dark:text-slate-300">
                                  Vous
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="py-4 px-2">
                        <select
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none transition-all ${
                            draft.role === "admin"
                              ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                              : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          }`}
                          value={draft.role}
                          onChange={(e) => updateDraftField(u.id, "role", e.target.value as UserRole, u)}
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>

                      {/* Clé API Gemini */}
                      <td className="py-4 px-2">
                        <div className="relative flex items-center w-36 sm:w-44">
                          <input
                            type={showRowApiKey[u.id] ? "text" : "password"}
                            placeholder="Aucune clé (système)"
                            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-full pr-7 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={draft.geminiApiKey}
                            onChange={(e) => updateDraftField(u.id, "geminiApiKey", e.target.value, u)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRowApiKey((p) => ({ ...p, [u.id]: !p[u.id] }))}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title={showRowApiKey[u.id] ? "Masquer la clé" : "Afficher la clé"}
                          >
                            {showRowApiKey[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Nouveau mot de passe */}
                      <td className="py-4 px-2">
                        <div className="relative flex items-center w-32 sm:w-40">
                          <input
                            type={showRowPassword[u.id] ? "text" : "password"}
                            placeholder="Nouveau mdp..."
                            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-full pr-7 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder:text-slate-400"
                            value={draft.newPassword}
                            onChange={(e) => updateDraftField(u.id, "newPassword", e.target.value, u)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRowPassword((p) => ({ ...p, [u.id]: !p[u.id] }))}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title={showRowPassword[u.id] ? "Masquer" : "Afficher"}
                          >
                            {showRowPassword[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Actions & Confirmation */}
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSaved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <Check size={14} />
                              Enregistré
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSaveUser(u.id)}
                              disabled={isSaving}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                hasChanges
                                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                              }`}
                              title="Enregistrer et confirmer les modifications de cet utilisateur"
                            >
                              <Check size={14} />
                              {hasChanges ? "Confirmer" : "Enregistrer"}
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(u.id)}
                            className={`p-1.5 transition-all rounded-lg ${
                              u.id === "admin-1" || (currentUser && u.id === currentUser.id)
                                ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                : "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                            }`}
                            disabled={u.id === "admin-1" || (currentUser && u.id === currentUser.id)}
                            title={
                              u.id === "admin-1"
                                ? "Administrateur principal protégé"
                                : isSelf
                                ? "Vous ne pouvez pas supprimer votre propre compte"
                                : "Supprimer cet utilisateur"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
