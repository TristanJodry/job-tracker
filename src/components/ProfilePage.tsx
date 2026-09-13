import React, { useState, useEffect, useRef } from "react";
import { User, Profile, DOMAINS, JOBS_BY_DOMAIN, LICENSE_TYPES } from "../types";
import { 
  Save, UserCircle, MapPin, Phone, Calendar, Briefcase, Car, Plus, X, 
  Shield, Lock, Eye, EyeOff, Check, CheckCircle2, FileText, UploadCloud, 
  Download, Trash2, Maximize2, RefreshCw, AlertCircle, FileCheck, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfilePageProps {
  user: User;
  profile?: Profile;
  onSave: (profile: Profile) => void;
  onUpdateAccount?: (accountData: { password?: string; geminiApiKey?: string }) => void | Promise<void>;
}

export default function ProfilePage({ user, profile, onSave, onUpdateAccount }: ProfilePageProps) {
  const [formData, setFormData] = useState<Profile>(
    profile || {
      userId: user.id,
      firstName: "",
      lastName: "",
      birthDate: "",
      address: "",
      phone: "",
      hasLicense: false,
      licenseTypes: [],
      isVehiculated: false,
      cvUrl: "",
      cvFileName: "",
      cvFileType: "",
      cvFileSize: 0,
      cvData: "",
      cvUploadedAt: "",
      targetDomain: "",
      targetJob: "",
      searchLocation: "",
      searchRadius: 10,
    }
  );

  const [customLicense, setCustomLicense] = useState("");
  const [showCustomLicense, setShowCustomLicense] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // CV State
  const [isDragging, setIsDragging] = useState(false);
  const [cvNotification, setCvNotification] = useState<string | null>(null);
  const [showFullscreenCV, setShowFullscreenCV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({ ...prev, ...profile }));
    }
  }, [profile]);

  // CV File Upload Handler
  const processCVFile = (file: File) => {
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      alert("Veuillez sélectionner un fichier PDF ou une image (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (maximum 15 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated: Profile = {
        ...formData,
        cvFileName: file.name,
        cvFileType: file.type || (isPdf ? "application/pdf" : "image/png"),
        cvFileSize: file.size,
        cvData: dataUrl,
        cvUploadedAt: new Date().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setFormData(updated);
      onSave(updated);
      setCvNotification(`Le CV "${file.name}" a été chargé et sauvegardé !`);
      setTimeout(() => setCvNotification(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processCVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processCVFile(e.target.files[0]);
    }
  };

  const handleRemoveCV = () => {
    if (confirm("Voulez-vous vraiment supprimer votre CV du profil ?")) {
      const updated: Profile = {
        ...formData,
        cvFileName: undefined,
        cvFileType: undefined,
        cvFileSize: undefined,
        cvData: undefined,
        cvUploadedAt: undefined,
      };
      setFormData(updated);
      onSave(updated);
      setCvNotification("Votre CV a été retiré.");
      setTimeout(() => setCvNotification(null), 3000);
    }
  };

  const handleDownloadCV = () => {
    if (!formData.cvData) return;
    const a = document.createElement("a");
    a.href = formData.cvData;
    a.download = formData.cvFileName || "mon-cv.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 Ko";
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  // Address search
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

  // Save full profile
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  // Save password
  const handleSavePassword = async () => {
    setPasswordError(null);
    if (!newPassword.trim()) {
      setPasswordError("Veuillez saisir un mot de passe.");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSavingPassword(true);
    try {
      if (onUpdateAccount) {
        await onUpdateAccount({ password: newPassword.trim() });
      }
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setPasswordError("Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setSavingPassword(false);
    }
  };

  const currentJobs = formData.targetDomain ? JOBS_BY_DOMAIN[formData.targetDomain] || [] : [];
  const isPdf = formData.cvFileType === "application/pdf" || formData.cvFileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">Mon Profil</h2>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Renseignez vos coordonnées, vos compétences et déposez votre CV avec aperçu direct.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSavedSuccess && (
            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={18} /> Profil enregistré !
            </span>
          )}
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/20 cursor-pointer"
          >
            <Save size={18} />
            Enregistrer le profil
          </button>
        </div>
      </div>

      {/* SECTION 1: MON CURRICULUM VITAE (CV) */}
      <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold dark:text-white">Mon Curriculum Vitae (CV)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Déposez votre CV au format PDF ou Image pour le prévisualiser instantanément.
              </p>
            </div>
          </div>

          {/* Action buttons if CV exists */}
          {formData.cvData && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowFullscreenCV(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Aperçu en plein écran"
              >
                <Maximize2 size={14} />
                <span>Plein écran</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                title="Télécharger le fichier"
              >
                <Download size={14} />
                <span>Télécharger</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Remplacer le CV"
              >
                <RefreshCw size={14} />
                <span>Remplacer</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveCV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                title="Supprimer le CV"
              >
                <Trash2 size={14} />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* CV Notification Banner */}
        <AnimatePresence>
          {cvNotification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 font-medium"
            >
              <FileCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>{cvNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {formData.cvData ? (
          /* PREVIEW STATE */
          <div className="space-y-4">
            {/* File info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg font-bold text-xs uppercase ${
                  isPdf 
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" 
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                }`}>
                  {isPdf ? "PDF" : "IMAGE"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {formData.cvFileName || "mon-cv.pdf"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Taille : <span className="font-medium">{formatFileSize(formData.cvFileSize)}</span>
                    {formData.cvUploadedAt && ` • Déposé le ${formData.cvUploadedAt}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Check size={14} /> Fichier chargé
                </span>
              </div>
            </div>

            {/* Interactive Preview Container */}
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900/5 dark:bg-slate-900/60 shadow-inner">
              {isPdf ? (
                <div className="w-full">
                  <iframe
                    src={formData.cvData}
                    title="Aperçu interactif du CV PDF"
                    className="w-full h-[580px] rounded-2xl border-0 bg-white"
                  />
                  <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm flex items-center justify-center gap-4">
                    <span>Aperçu interactif PDF chargé.</span>
                    <button
                      type="button"
                      onClick={() => setShowFullscreenCV(true)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 size={12} /> Agrandir la vue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center">
                  <img
                    src={formData.cvData}
                    alt="Aperçu du CV"
                    className="max-h-[580px] w-auto object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-700 cursor-pointer"
                    onClick={() => setShowFullscreenCV(true)}
                  />
                  <p className="text-xs text-slate-400 mt-3">Cliquez sur l'image pour afficher en plein écran.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* UPLOAD DROPZONE */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer transition-all duration-200 border-2 border-dashed rounded-2xl p-10 md:p-14 text-center flex flex-col items-center justify-center gap-4 ${
              isDragging
                ? "border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 scale-[1.01]"
                : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-blue-500"
            }`}
          >
            <div className={`p-4 rounded-full transition-colors ${
              isDragging
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
            }`}>
              <UploadCloud size={36} />
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800 dark:text-white">
                Glissez-déposez votre CV ici, ou <span className="text-blue-600 dark:text-blue-400 hover:underline">parcourez vos dossiers</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formats acceptés : PDF, PNG, JPG, JPEG, WEBP (taille max. 15 Mo)
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm mt-2">
              <FileCheck size={16} className="text-emerald-500" />
              L'aperçu du document s'affichera immédiatement ici
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: INFORMATIONS PERSONNELLES & PRÉFÉRENCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informations Personnelles */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-2.5 font-bold border-b border-slate-100 pb-4 dark:text-white dark:border-slate-700">
            <UserCircle className="text-blue-600 dark:text-blue-400" size={20} />
            <h3>Informations Personnelles</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                  Prénom
                </label>
                <input
                  type="text"
                  placeholder="Jean"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                  Nom
                </label>
                <input
                  type="text"
                  placeholder="Dupont"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 dark:text-slate-400">
                  <Calendar size={13} /> Date de Naissance
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 dark:text-slate-400">
                  <Phone size={13} /> Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Adresse avec autocomplétion API Adresse Gouv */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 dark:text-slate-400">
                <MapPin size={13} /> Adresse postale (France)
              </label>
              <input
                type="text"
                placeholder="Commencez à saisir votre adresse..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                value={formData.address}
                onChange={(e) => searchAddress(e.target.value)}
              />
              {addressSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                  {addressSuggestions.map((sug, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => selectAddress(sug)}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                    >
                      {sug.properties.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobilité & Permis */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400 flex items-center gap-1.5">
                  <Car size={13} /> Véhicule personnel
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isVehiculated}
                    onChange={(e) => setFormData({ ...formData, isVehiculated: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Permis de conduire & CACES */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Permis & Certifications
                </label>

                {formData.licenseTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.licenseTypes.map((type, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {type}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, licenseTypes: formData.licenseTypes.filter((_, i) => i !== idx) })}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun permis renseigné</p>
                )}

                <div className="flex gap-2 pt-1">
                  <select
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-xs cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value === "other") {
                        setShowCustomLicense(true);
                      } else if (e.target.value && !formData.licenseTypes.includes(e.target.value)) {
                        setFormData({ 
                          ...formData, 
                          hasLicense: true,
                          licenseTypes: [...formData.licenseTypes, e.target.value] 
                        });
                      }
                    }}
                  >
                    <option value="">+ Ajouter un permis ou titre...</option>
                    {LICENSE_TYPES.map(type => (
                      <option key={type} value={type} disabled={formData.licenseTypes.includes(type)}>{type}</option>
                    ))}
                    <option value="other">Autre certification / CACES...</option>
                  </select>

                  {formData.licenseTypes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, licenseTypes: [], hasLicense: false })}
                      className="px-3 text-xs text-rose-500 font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                {showCustomLicense && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Ex: CACES R489, Habilitation électrique..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      value={customLicense}
                      onChange={(e) => setCustomLicense(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customLicense.trim() && !formData.licenseTypes.includes(customLicense.trim())) {
                            setFormData({ ...formData, hasLicense: true, licenseTypes: [...formData.licenseTypes, customLicense.trim()] });
                            setCustomLicense("");
                            setShowCustomLicense(false);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customLicense.trim() && !formData.licenseTypes.includes(customLicense.trim())) {
                          setFormData({ ...formData, hasLicense: true, licenseTypes: [...formData.licenseTypes, customLicense.trim()] });
                          setCustomLicense("");
                          setShowCustomLicense(false);
                        }
                      }}
                      className="px-3 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomLicense(false)}
                      className="px-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Préférences Professionnelles */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-2.5 font-bold border-b border-slate-100 pb-4 dark:text-white dark:border-slate-700">
              <Briefcase className="text-blue-600 dark:text-blue-400" size={20} />
              <h3>Objectifs & Métier</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                  Domaine professionnel
                </label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white cursor-pointer"
                  value={formData.targetDomain}
                  onChange={(e) => setFormData({ ...formData, targetDomain: e.target.value, targetJob: "" })}
                >
                  <option value="">Sélectionnez un domaine</option>
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                  Poste ou Métier visé
                </label>
                <input
                  type="text"
                  list="jobs-list"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Ex: Développeur Full Stack, Comptable..."
                  value={formData.targetJob}
                  onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
                />
                <datalist id="jobs-list">
                  {currentJobs.map(job => <option key={job} value={job} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                  Zone de recherche prioritaire
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  placeholder="Ex: Paris, Lyon, Télétravail..."
                  value={formData.searchLocation}
                  onChange={(e) => setFormData({ ...formData, searchLocation: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: SÉCURITÉ DU COMPTE */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 font-bold dark:text-white">
                <Shield className="text-blue-600 dark:text-blue-400" size={18} />
                <h3 className="text-sm font-bold">Sécurité du Compte</h3>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                user.role === "admin"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              }`}>
                {user.role === "admin" ? "Admin" : "Utilisateur"}
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                Modifier le mot de passe
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nouveau mot de passe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs pr-8 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordError && (
                <p className="text-xs text-rose-500 font-medium">{passwordError}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSavePassword}
                  disabled={savingPassword || !newPassword}
                  className="bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-all flex items-center gap-1.5 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer disabled:opacity-50"
                >
                  <Lock size={14} />
                  Confirmer le mot de passe
                </button>

                {passwordSaved && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={15} /> Mis à jour !
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FULLSCREEN CV MODAL */}
      <AnimatePresence>
        {showFullscreenCV && formData.cvData && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col p-4 md:p-6 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 rounded-t-2xl border border-slate-800 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={20} className="text-blue-400" />
                <span className="font-bold text-sm md:text-base truncate">
                  {formData.cvFileName || "Aperçu du CV"}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  ({formatFileSize(formData.cvFileSize)})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadCV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Download size={14} /> Télécharger
                </button>
                <button
                  onClick={() => setShowFullscreenCV(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-slate-900/90 rounded-b-2xl border-x border-b border-slate-800 overflow-hidden flex items-center justify-center p-2 md:p-4">
              {isPdf ? (
                <iframe
                  src={formData.cvData}
                  title="Aperçu Grand Format du CV"
                  className="w-full h-full rounded-xl bg-white border-0"
                />
              ) : (
                <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                  <img
                    src={formData.cvData}
                    alt="Aperçu Grand Format du CV"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
