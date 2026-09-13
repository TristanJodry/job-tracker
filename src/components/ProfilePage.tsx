import React, { useState, useEffect } from "react";
import { User, Profile, DOMAINS, JOBS_BY_DOMAIN, LICENSE_TYPES } from "../types";
import { Save, UserCircle, MapPin, Phone, Calendar, Briefcase, CreditCard, Car, Plus, X } from "lucide-react";
import { motion } from "motion/react";

interface ProfilePageProps {
  user: User;
  profile?: Profile;
  onSave: (profile: Profile) => void;
}

export default function ProfilePage({ user, profile, onSave }: ProfilePageProps) {
  const [formData, setFormData] = useState<Profile>(
    profile || {
      userId: user.id,
      firstName: "",
      lastName: "",
      birthDate: "",
      address: "",
      phone: "",
      licenseTypes: profile?.licenseTypes || [],
      isVehiculated: profile?.isVehiculated || false,
      targetDomain: profile?.targetDomain || "",
      targetJob: "",
      searchLocation: "",
      searchRadius: 10,
    }
  );

  const [customLicense, setCustomLicense] = useState("");
  const [showCustomLicense, setShowCustomLicense] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

  const searchAddress = async (query: string) => {
    setFormData({ ...formData, address: query });
    if (query.length > 3) {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setAddressSuggestions(data.features || []);
      } catch (err) {
        console.error("Address search failed", err);
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  const selectAddress = (suggestion: any) => {
    setFormData({ ...formData, address: suggestion.properties.label });
    setAddressSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert("Profil sauvegardé avec succès !");
  };

  const currentJobs = formData.targetDomain ? JOBS_BY_DOMAIN[formData.targetDomain] || [] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">Mon Profil</h2>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Gérez vos informations personnelles et vos préférences de recherche.</p>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
        >
          <Save size={18} />
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informations Personnelles */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-2 font-bold border-b border-slate-50 pb-4 dark:text-white dark:border-slate-700">
            <UserCircle className="text-blue-600" size={20} />
            <h3>Informations Personnelles</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Prénom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                  <Calendar size={12} /> Date de naissance
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                  <Phone size={12} /> Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 dark:text-slate-400">
                <MapPin size={12} /> Adresse (Autocomplete gratuit)
              </label>
              <input
                type="text"
                placeholder="Commencez à taper votre adresse..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={formData.address}
                onChange={(e) => searchAddress(e.target.value)}
              />
              {addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                  {addressSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-700 dark:text-slate-300"
                      onClick={() => selectAddress(s)}
                    >
                      {s.properties.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-4 dark:bg-slate-900/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Permis & Mobilité</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer dark:bg-slate-700 dark:border-slate-600"
                      checked={formData.isVehiculated}
                      onChange={(e) => setFormData({ ...formData, isVehiculated: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex items-center gap-2 dark:text-slate-300 dark:group-hover:text-white">
                      <Car size={14} /> Véhiculé
                    </span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Liste des permis</span>
                  </div>

                  {formData.licenseTypes.length === 0 ? (
                    <div className="p-3 border border-dashed border-slate-200 rounded-lg text-center dark:border-slate-700">
                      <p className="text-sm text-slate-500 italic dark:text-slate-400">Aucun permis (ou en cours)</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.licenseTypes.map((type, idx) => (
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={idx} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          {type}
                          <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, licenseTypes: formData.licenseTypes.filter((_, i) => i !== idx) })}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm appearance-none cursor-pointer"
                        value=""
                        onChange={(e) => {
                          if (e.target.value === "other") {
                            setShowCustomLicense(true);
                          } else if (e.target.value && !formData.licenseTypes.includes(e.target.value)) {
                            setFormData({ ...formData, licenseTypes: [...formData.licenseTypes, e.target.value] });
                          }
                        }}
                      >
                        <option value="">+ Ajouter un permis</option>
                        {LICENSE_TYPES.map(type => (
                          <option key={type} value={type} disabled={formData.licenseTypes.includes(type)}>{type}</option>
                        ))}
                        <option value="other">Autre (CACES, etc.)...</option>
                      </select>
                      <Plus size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    
                    {formData.licenseTypes.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => {
                          if(confirm("Effacer tous les permis ?")) {
                            setFormData({ ...formData, licenseTypes: [] });
                          }
                        }}
                        className="px-3 text-xs text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        RAZ
                      </button>
                    )}
                  </div>

                  {showCustomLicense && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                      <input
                        type="text"
                        placeholder="Précisez le permis..."
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                        value={customLicense}
                        onChange={(e) => setCustomLicense(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customLicense && !formData.licenseTypes.includes(customLicense)) {
                              setFormData({ ...formData, licenseTypes: [...formData.licenseTypes, customLicense] });
                              setCustomLicense("");
                              setShowCustomLicense(false);
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (customLicense && !formData.licenseTypes.includes(customLicense)) {
                            setFormData({ ...formData, licenseTypes: [...formData.licenseTypes, customLicense] });
                            setCustomLicense("");
                            setShowCustomLicense(false);
                          }
                        }}
                        className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowCustomLicense(false)}
                        className="px-3 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Préférences de Recherche */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-2 font-bold border-b border-slate-50 pb-4 dark:text-white dark:border-slate-700">
            <Briefcase className="text-blue-600" size={20} />
            <h3>Préférences de Recherche</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Domaine recherché</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={formData.targetDomain}
                onChange={(e) => setFormData({ ...formData, targetDomain: e.target.value, targetJob: "" })}
              >
                <option value="">Sélectionnez un domaine</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Poste visé</label>
              <input
                type="text"
                list="jobs-list"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Tapez pour rechercher ou saisir un poste..."
                value={formData.targetJob}
                onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
              />
              <datalist id="jobs-list">
                {currentJobs.map(job => <option key={job} value={job} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Localisation (Autocomplete)</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Ville ou Code Postal..."
                value={formData.searchLocation}
                onChange={(e) => setFormData({ ...formData, searchLocation: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Rayon de recherche</label>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{formData.searchRadius} km</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-700"
                value={formData.searchRadius}
                onChange={(e) => setFormData({ ...formData, searchRadius: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
