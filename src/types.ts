export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  geminiApiKey?: string;
}

export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  phone: string;
  hasLicense: boolean;
  licenseTypes: string[];
  isVehiculated: boolean;
  cvUrl?: string;
  targetDomain: string;
  targetJob: string;
  searchLocation: string;
  searchRadius: number;
}

export type ApplicationStatus = 
  | "A postuler" 
  | "Contacté" 
  | "En attente" 
  | "Réponse reçue" 
  | "Entretien prévu" 
  | "Refusé" 
  | "Offre reçue";

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  location: string;
  status: ApplicationStatus;
  dateApplied: string;
  lastFollowUp?: string;
  nextStep?: string;
  notes: string;
  contactPerson?: string;
  contactInfo?: string;
  sourceUrl?: string;
}

export interface Database {
  users: User[];
  profiles: Profile[];
  applications: JobApplication[];
}

export const DOMAINS = [
  "Informatique / Développement / Tech",
  "Vente / Commerce / Relation Client",
  "Logistique / Transport / Achat",
  "Santé / Social / Paramédical",
  "Éducation / Formation",
  "Artisanat / Bâtiment / Industrie",
  "Banque / Assurance / Finance",
  "Hôtellerie / Restauration / Tourisme",
  "Marketing / Communication / Design",
  "Ressources Humaines / Management",
  "Administratif / Secrétariat",
  "Autre"
];

export const JOBS_BY_DOMAIN: Record<string, string[]> = {
  "Informatique / Développement / Tech": ["Développeur Web", "Développeur Mobile", "Data Scientist", "Ingénieur DevOps", "Product Manager", "Cybersecurity Expert", "Cloud Architect", "UI/UX Designer"],
  "Vente / Commerce / Relation Client": ["Commercial", "Vendeur Conseil", "Responsable de Magasin", "Téléconseiller", "Business Developer", "Account Manager"],
  "Logistique / Transport / Achat": ["Chauffeur Livreur", "Magasinier", "Responsable Logistique", "Acheteur", "Gestionnaire de Stocks"],
  "Santé / Social / Paramédical": ["Infirmier", "Aide-Soignant", "Médecin", "Éducateur Spécialisé", "Kinésithérapeute", "Assistant Social"],
  "Éducation / Formation": ["Professeur", "Formateur", "Conseiller d'Orientation", "Animateur", "Directeur d'École"],
  "Artisanat / Bâtiment / Industrie": ["Électricien", "Plombier", "Menuisier", "Mécanicien", "Maçon", "Technicien de Maintenance"],
  "Banque / Assurance / Finance": ["Conseiller Bancaire", "Comptable", "Contrôleur de Gestion", "Courtier", "Analyste Financier"],
  "Hôtellerie / Restauration / Tourisme": ["Serveur", "Cuisinier", "Réceptionniste", "Guide Touristique", "Barman", "Maître d'Hôtel"],
  "Marketing / Communication / Design": ["Chargé de Communication", "Community Manager", "Graphiste", "Chef de Projet Marketing", "Rédacteur Web"],
  "Ressources Humaines / Management": ["Chargé de Recrutement", "Responsable RH", "Gestionnaire de Paie", "Directeur d'Agence"],
  "Administratif / Secrétariat": ["Assistant de Direction", "Secrétaire Médicale", "Assistant Administratif", "Hôte d'Accueil"],
  "Autre": []
};

export const LICENSE_TYPES = [
  "Permis B (Voiture)",
  "Permis A / A1 / A2 (Moto)",
  "Permis C / C1 (Poids Lourd)",
  "Permis D (Transport en commun)",
  "Permis E (Remorque)",
  "Permis BSR / AM",
  "CACES"
];
