import React, { useState } from "react";
import { JobApplication, ApplicationStatus } from "../types";
import { X, Save, Building2, MapPin, Briefcase, Link, User, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ManualApplicationModalProps {
  userId: string;
  onClose: () => void;
  onSave: (app: JobApplication) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  "A postuler",
  "Contacté",
  "En attente",
  "Entretien prévu",
  "Réponse reçue",
  "Offre reçue",
  "Refusé"
];

export default function ManualApplicationModal({ userId, onClose, onSave }: ManualApplicationModalProps) {
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    userId,
    company: "",
    jobTitle: "",
    location: "",
    status: "A postuler",
    dateApplied: new Date().toISOString().split('T')[0],
    notes: "",
    sourceUrl: "",
    contactPerson: "",
    contactInfo: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.jobTitle) {
      alert("Veuillez remplir au moins l'entreprise et le poste.");
      return;
    }

    const newApp: JobApplication = {
      id: Math.random().toString(36).substr(2, 9),
      userId: userId,
      company: formData.company || "",
      jobTitle: formData.jobTitle || "",
      location: formData.location || "",
      status: (formData.status as ApplicationStatus) || "A postuler",
      dateApplied: formData.dateApplied || new Date().toISOString().split('T')[0],
      notes: formData.notes || "",
      sourceUrl: formData.sourceUrl || "",
      contactPerson: formData.contactPerson || "",
      contactInfo: formData.contactInfo || ""
    };

    onSave(newApp);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden dark:bg-slate-800 dark:border dark:border-slate-700"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
          <h3 className="text-xl font-bold dark:text-white">Nouvelle Candidature</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entreprise & Poste */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                  <Building2 size={12} /> Entreprise *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                  <Briefcase size={12} /> Poste *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                  <MapPin size={12} /> Localisation
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Statut & Date */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Statut</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Date de candidature</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.dateApplied}
                  onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                  <Link size={12} /> URL de l'offre
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                <User size={12} /> Contact (Nom)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                <Info size={12} /> Contact (Email/Tél)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Notes / Commentaires</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Précisions sur le poste, relances prévues..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
            >
              <Save size={18} />
              Enregistrer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
