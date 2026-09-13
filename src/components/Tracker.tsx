import React, { useState } from "react";
import { JobApplication, ApplicationStatus, User } from "../types";
import { Calendar, Building2, MapPin, Clock, MessageSquare, Plus, Trash2, AlertCircle, Edit3, Search, ExternalLink, UserCheck, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ManualApplicationModal from "./ManualApplicationModal";

interface TrackerProps {
  user: User;
  applications: JobApplication[];
  onUpdate: (apps: JobApplication[]) => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  "A postuler": "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  "Contacté": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "En attente": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Réponse reçue": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Entretien prévu": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold",
  "Refusé": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "Offre reçue": "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-200 dark:shadow-emerald-900/30",
};

export default function Tracker({ user, applications, onUpdate }: TrackerProps) {
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const handleSaveApp = (app: JobApplication) => {
    const exists = applications.some(a => a.id === app.id);
    if (exists) {
      onUpdate(applications.map(a => a.id === app.id ? app : a));
    } else {
      onUpdate([app, ...applications]);
    }
    setShowManualModal(false);
    setEditingApp(null);
  };

  const stats = {
    total: applications.length,
    active: applications.filter(a => !["Refusé", "Offre reçue"].includes(a.status)).length,
    interviews: applications.filter(a => a.status === "Entretien prévu").length,
    offers: applications.filter(a => a.status === "Offre reçue").length,
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return !["Refusé", "Offre reçue"].includes(app.status);
    return app.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">Mes Candidatures</h2>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Créez et suivez manuellement l'avancement de vos démarches d'embauche.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingApp(null);
              setShowManualModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 dark:shadow-blue-900/20 cursor-pointer"
          >
            <Plus size={18} />
            <span>Nouvelle candidature</span>
          </button>
          
          <div className="hidden lg:flex gap-4 px-4 py-2 rounded-2xl border shadow-sm bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</p>
              <p className="text-lg font-bold dark:text-white">{stats.total}</p>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-700" />
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">En cours</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-700" />
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Entretiens</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.interviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher entreprise, poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "Toutes" },
            { id: "active", label: "En cours" },
            { id: "Entretien prévu", label: "Entretiens" },
            { id: "Offre reçue", label: "Offres" },
            { id: "Refusé", label: "Refusées" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredApps.map((app) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between md:justify-start gap-3 flex-wrap">
                    <h3 className="text-xl font-bold dark:text-white">{app.jobTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                      <Building2 size={16} className="text-slate-400" /> {app.company}
                    </div>
                    {app.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-slate-400" /> {app.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-slate-400" /> Postulé le {app.dateApplied}
                    </div>
                    {app.lastFollowUp && (
                      <div className="flex items-center gap-1.5 text-blue-600 font-medium dark:text-blue-400">
                        <Clock size={16} /> Relance : {app.lastFollowUp}
                      </div>
                    )}
                    {app.sourceUrl && (
                      <a
                        href={app.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <ExternalLink size={14} /> Voir l'offre
                      </a>
                    )}
                  </div>

                  {(app.contactPerson || app.contactInfo) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 w-fit">
                      {app.contactPerson && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <UserCheck size={14} className="text-blue-500" /> {app.contactPerson}
                        </span>
                      )}
                      {app.contactInfo && (
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <PhoneCall size={14} className="text-slate-400" /> {app.contactInfo}
                        </span>
                      )}
                    </div>
                  )}

                  {app.notes && (
                    <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 flex gap-3 dark:bg-slate-700/50 dark:text-slate-300">
                      <MessageSquare size={18} className="text-slate-400 flex-shrink-0" />
                      <p className="whitespace-pre-line">{app.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end gap-3 min-w-[210px] items-stretch">
                  <select
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white cursor-pointer"
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
                  
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => {
                        setEditingApp(app);
                        setShowManualModal(true);
                      }}
                      title="Modifier la candidature"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteApp(app.id)}
                      title="Supprimer la candidature"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredApps.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-500 dark:text-blue-400">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold dark:text-white">
                {searchTerm || statusFilter !== "all" ? "Aucun résultat trouvé" : "Aucune candidature enregistrée"}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1 text-sm dark:text-slate-400">
                {searchTerm || statusFilter !== "all" 
                  ? "Essayez d'ajuster vos critères de filtre ou de recherche."
                  : "Enregistrez manuellement votre première candidature pour démarrer votre suivi personnalisé."}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingApp(null);
                setShowManualModal(true);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 dark:shadow-blue-900/20 cursor-pointer"
            >
              <Plus size={18} />
              <span>Créer une candidature</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showManualModal && (
          <ManualApplicationModal 
            userId={user.id} 
            initialData={editingApp}
            onClose={() => {
              setShowManualModal(false);
              setEditingApp(null);
            }} 
            onSave={handleSaveApp} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

