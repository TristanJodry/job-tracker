import React, { useState } from "react";
import { JobApplication, ApplicationStatus, User } from "../types";
import { Calendar, Building2, MapPin, Clock, MessageSquare, Plus, MoreVertical, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ManualApplicationModal from "./ManualApplicationModal";

interface TrackerProps {
  user: User;
  applications: JobApplication[];
  onUpdate: (apps: JobApplication[]) => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  "A postuler": "bg-slate-100 text-slate-600",
  "Contacté": "bg-blue-100 text-blue-600",
  "En attente": "bg-yellow-100 text-yellow-600",
  "Réponse reçue": "bg-purple-100 text-purple-600",
  "Entretien prévu": "bg-emerald-100 text-emerald-600",
  "Refusé": "bg-red-100 text-red-600",
  "Offre reçue": "bg-indigo-600 text-white shadow-lg shadow-indigo-100",
};

export default function Tracker({ user, applications, onUpdate }: TrackerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  const updateStatus = (id: string, newStatus: ApplicationStatus) => {
    const newApps = applications.map(app => 
      app.id === id ? { ...app, status: newStatus, lastFollowUp: new Date().toISOString().split('T')[0] } : app
    );
    onUpdate(newApps);
  };

  const deleteApp = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette candidature ?")) {
      onUpdate(applications.filter(app => app.id !== id));
    }
  };

  const addManualApp = (app: JobApplication) => {
    onUpdate([...applications, app]);
    setShowManualModal(false);
  };

  const stats = {
    total: applications.length,
    active: applications.filter(a => !["Refusé", "Offre reçue", "A postuler"].includes(a.status)).length,
    interviews: applications.filter(a => a.status === "Entretien prévu").length,
    offers: applications.filter(a => a.status === "Offre reçue").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Candidatures</h2>
          <p className="text-slate-500 mt-1">Suivez l'avancement de vos recherches en temps réel.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
          <div className="hidden sm:flex gap-4 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</p>
              <p className="text-lg font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actives</p>
              <p className="text-lg font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Entretiens</p>
              <p className="text-lg font-bold text-emerald-600">{stats.interviews}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {applications.map((app) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between md:justify-start gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{app.jobTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5"><Building2 size={16} className="text-slate-400" /> {app.company}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {app.location}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> Postulé le {app.dateApplied}</div>
                    {app.lastFollowUp && (
                      <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                        <Clock size={16} /> Relancé le {app.lastFollowUp}
                      </div>
                    )}
                  </div>

                  {app.notes && (
                    <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 flex gap-3">
                      <MessageSquare size={18} className="text-slate-400 flex-shrink-0" />
                      <p>{app.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end gap-3 min-w-[200px]">
                  <select
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                  >
                    <option value="A postuler">A postuler</option>
                    <option value="Contacté">Contacté</option>
                    <option value="En attente">En attente</option>
                    <option value="Réponse reçue">Réponse reçue</option>
                    <option value="Entretien prévu">Entretien prévu</option>
                    <option value="Offre reçue">Offre reçue</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => deleteApp(app.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {applications.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucune candidature</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Ajoutez votre première candidature depuis l'onglet "Recherche" ou manuellement.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showManualModal && (
          <ManualApplicationModal 
            userId={user.id} 
            onClose={() => setShowManualModal(false)} 
            onSave={addManualApp} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
