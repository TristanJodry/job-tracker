import React, { useState } from "react";
import { Profile, JobApplication } from "../types";
import { Search, MapPin, Building2, Briefcase, Plus, ExternalLink, Filter } from "lucide-react";
import { motion } from "motion/react";

interface JobSearchProps {
  profile?: Profile;
  onAddApplication: (app: JobApplication) => void;
}

// Mock results to simulate scraping
const MOCK_JOBS = [
  { id: "1", title: "Développeur Fullstack React/Node", company: "TechSolutions", location: "Paris (75)", source: "HelloWork" },
  { id: "2", title: "Développeur Front-end Junior", company: "WebAgency", location: "Lyon (69)", source: "LinkedIn" },
  { id: "3", title: "Ingénieur Logiciel (H/F)", company: "InnovCorp", location: "Bordeaux (33)", source: "Indeed" },
  { id: "4", title: "Lead Developer", company: "StartupX", location: "Nantes (44)", source: "HelloWork" },
  { id: "5", title: "Développeur TypeScript", company: "OpenSource Lab", location: "Lille (59)", source: "LinkedIn" },
];

export default function JobSearch({ profile, onAddApplication }: JobSearchProps) {
  const [searchQuery, setSearchQuery] = useState(profile?.targetJob || "");
  const [locationQuery, setLocationQuery] = useState(profile?.searchLocation || "");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchMessage(null);
    try {
      const apiKeyParam = profile?.userId ? `&userApiKey=${encodeURIComponent(localStorage.getItem(`gemini_api_key_${profile.userId}`) || "")}` : "";
      const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(locationQuery)}${apiKeyParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.type === "fallback") {
          setSearchMessage(data.message);
        }
        setResults(data.results.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.company.display_name,
          location: j.location.display_name,
          source: j.source || "Autre",
          url: j.redirect_url
        })));
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const addJob = (job: any) => {
    const newApp: JobApplication = {
      id: Math.random().toString(36).substr(2, 9),
      userId: profile?.userId || "user-1",
      company: job.company,
      jobTitle: job.title,
      location: job.location,
      status: "A postuler",
      dateApplied: new Date().toISOString().split('T')[0],
      notes: `Trouvé sur ${job.source}`,
      sourceUrl: job.url
    };
    onAddApplication(newApp);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight dark:text-white">Trouver des offres</h2>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Recherche automatique basée sur vos préférences (LinkedIn, HelloWork, Indeed).</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            placeholder="Poste, mots-clés ou entreprise"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:w-64 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            placeholder="Ville"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
          disabled={isSearching}
        >
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search size={20} />
          )}
          Rechercher
        </button>
      </form>

      <div className="space-y-4">
        {searchMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-3 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-800">
              <Filter size={16} />
            </div>
            {searchMessage} Pour des résultats temps réel illimités, renseignez votre clé API dans votre profil.
          </motion.div>
        )}

        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold dark:text-white">Résultats ({results.length})</h3>
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors dark:hover:text-slate-300">
            <Filter size={16} /> Filtrer
          </button>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {results.map((job) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={job.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-all group dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Building2 size={14} /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium dark:bg-slate-700 dark:text-slate-300">{job.source}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <ExternalLink size={16} /> Voir
                  </a>
                  <button 
                    onClick={() => addJob(job)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                  >
                    <Plus size={18} /> Ajouter
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          !isSearching && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4 dark:bg-slate-700">
                <Search size={32} />
              </div>
              <p className="text-slate-500 dark:text-slate-400">Lancez une recherche pour voir les opportunités disponibles.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
