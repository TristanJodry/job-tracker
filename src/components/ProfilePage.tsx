import React, { useState, useEffect } from "react";
import { User, Profile, DOMAINS, JOBS_BY_DOMAIN, LICENSE_TYPES } from "../types";
import { Save, UserCircle, MapPin, Phone, Calendar, Briefcase, CreditCard, Car, Plus } from "lucide-react";

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
      hasLicense: false,
      licenseType: "",
      isVehiculated: false,
      targetDomain: "",
      targetJob: "",
      searchLocation: "",
      searchRadius: 10,
    }
  );

  const [customLicense, setCustomLicense] = useState("");
  const [showCustomLicense, setShowCustomLicense] = useState(false);

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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mon Profil</h2>
          <p className="text-slate-500 mt-1">Gérez vos informations personnelles et vos préférences de recherche.</p>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Save size={18} />
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informations Personnelles */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-50 pb-4">
            <UserCircle className="text-blue-600" size={20} />
            <h3>Informations Personnelles</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Prénom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Date de naissance
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone size={12} /> Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin size={12} /> Adresse (Autocomplete)
              </label>
              <input
                type="text"
                placeholder="Commencez à taper votre adresse..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={formData.hasLicense}
                    onChange={(e) => setFormData({ ...formData, hasLicense: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                    <CreditCard size={14} /> Permis de conduire
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={formData.isVehiculated}
                    onChange={(e) => setFormData({ ...formData, isVehiculated: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                    <Car size={14} /> Véhiculé
                  </span>
                </label>
              </div>
              
              {formData.hasLicense && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type de permis</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.licenseType}
                    onChange={(e) => {
                      if (e.target.value === "other") {
                        setShowCustomLicense(true);
                      } else {
                        setShowCustomLicense(false);
                        setFormData({ ...formData, licenseType: e.target.value });
                      }
                    }}
                  >
                    <option value="">Sélectionnez un permis</option>
                    {LICENSE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    <option value="other">+ Autre permis...</option>
                  </select>

                  {showCustomLicense && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                      <input
                        type="text"
                        placeholder="Précisez le permis..."
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={customLicense}
                        onChange={(e) => setCustomLicense(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (customLicense) {
                            setFormData({ ...formData, licenseType: customLicense });
                            setShowCustomLicense(false);
                          }
                        }}
                        className="px-3 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Préférences de Recherche */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-50 pb-4">
            <Briefcase className="text-blue-600" size={20} />
            <h3>Préférences de Recherche</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Domaine recherché</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.targetDomain}
                onChange={(e) => setFormData({ ...formData, targetDomain: e.target.value, targetJob: "" })}
              >
                <option value="">Sélectionnez un domaine</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Poste visé</label>
              <input
                type="text"
                list="jobs-list"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tapez pour rechercher ou saisir un poste..."
                value={formData.targetJob}
                onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
              />
              <datalist id="jobs-list">
                {currentJobs.map(job => <option key={job} value={job} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Localisation (Autocomplete)</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ville ou Code Postal..."
                value={formData.searchLocation}
                onChange={(e) => setFormData({ ...formData, searchLocation: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Rayon de recherche</label>
                <span className="text-xs font-bold text-blue-600">{formData.searchRadius} km</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
