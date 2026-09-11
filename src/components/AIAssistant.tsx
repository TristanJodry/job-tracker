import React, { useState } from "react";
import { User, Profile } from "../types";
import { Sparkles, FileText, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface AIAssistantProps {
  user: User;
  profile?: Profile;
}

export default function AIAssistant({ user, profile }: AIAssistantProps) {
  const [cvText, setCvText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<"audit" | "letter">("audit");

  const handleAction = async () => {
    if (!cvText) return alert("Veuillez entrer le texte de votre CV.");
    setIsLoading(true);
    setResult(null);

    const prompt = mode === "audit" 
      ? `Agis comme un expert RH. Voici le texte d'un CV. Donne des conseils précis (points positifs, points négatifs, axes d'amélioration) pour un poste de "${profile?.targetJob || "un poste standard"}" dans le domaine "${profile?.targetDomain || "général"}".
         Texte du CV : ${cvText}`
      : `Génère une lettre de motivation percutante pour un poste de "${profile?.targetJob || "un poste standard"}" dans le domaine "${profile?.targetDomain || "général"}". 
         Utilise ces informations de profil : Prénom ${profile?.firstName}, Nom ${profile?.lastName}.
         Voici mon expérience basée sur mon CV : ${cvText}`;

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          userApiKey: user.geminiApiKey 
        }),
      });
      const data = await res.json();
      setResult(data.text);
    } catch (error) {
      console.error(error);
      setResult("Désolé, une erreur est survenue lors de la génération.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Assistant IA <Sparkles className="text-blue-600" />
          </h2>
          <p className="text-slate-500 mt-1">Améliorez votre CV et générez des lettres de motivation grâce à l'IA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Contenu de votre CV
            </label>
            <textarea
              className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
              placeholder="Copiez-collez ici le texte de votre CV pour analyse..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setMode("audit"); handleAction(); }}
              disabled={isLoading || !cvText}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                mode === "audit" && !isLoading 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              } disabled:opacity-50`}
            >
              {isLoading && mode === "audit" ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              Analyser mon CV
            </button>
            <button
              onClick={() => { setMode("letter"); handleAction(); }}
              disabled={isLoading || !cvText}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                mode === "letter" && !isLoading 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              } disabled:opacity-50`}
            >
              {isLoading && mode === "letter" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Générer une lettre
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full min-h-[400px]"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                <h3 className="font-bold text-slate-900 text-lg">
                  {mode === "audit" ? "Résultat de l'analyse" : "Lettre de motivation générée"}
                </h3>
                <button 
                  onClick={() => { navigator.clipboard.writeText(result); alert("Copié !"); }}
                  className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline"
                >
                  Copier le texte
                </button>
              </div>
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
                  {result}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                <Sparkles size={32} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">En attente d'action</h3>
              <p className="text-slate-500 max-w-xs text-sm">
                Remplissez votre CV à gauche et choisissez une action pour que l'IA vous aide.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
