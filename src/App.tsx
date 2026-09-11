import { useState, useEffect } from "react";
import { User, Database, Profile, JobApplication } from "./types";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import AdminPanel from "./components/AdminPanel";
import ProfilePage from "./components/ProfilePage";
import JobSearch from "./components/JobSearch";
import Tracker from "./components/Tracker";
import AIAssistant from "./components/AIAssistant";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [db, setDb] = useState<Database | null>(null);
  const [activeTab, setActiveTab] = useState("tracker");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/db")
      .then((res) => res.json())
      .then((data) => {
        setDb(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load DB", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user && user.role === "admin" && activeTab !== "admin") {
      setActiveTab("admin");
    } else if (user && user.role === "user" && activeTab === "admin") {
      setActiveTab("tracker");
    }
  }, [user, activeTab]);

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.role === "admin") setActiveTab("admin");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("tracker");
  };

  const updateDb = async (newDb: Database) => {
    setDb(newDb);
    // On update, we send the FULL database including passwords (they will be hashed on server if needed)
    // But wait, the client doesn't have passwords from the get request.
    // This is a bit tricky. The admin panel needs to manage passwords.
    // I'll update the server.ts to be smarter about it.
    await fetch("/api/db/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDb),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login users={db?.users || []} onLogin={handleLogin} />;
  }

  const currentUserProfile = db?.profiles.find((p) => p.userId === user.id);
  const userApplications = db?.applications.filter((a) => a.userId === user.id) || [];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "profile" && user.role !== "admin" && (
              <ProfilePage 
                user={user} 
                profile={currentUserProfile} 
                onSave={(p) => {
                  if (!db) return;
                  const newProfiles = db.profiles.filter(pr => pr.userId !== user.id);
                  updateDb({ ...db, profiles: [...newProfiles, p] });
                }} 
              />
            )}
            
            {activeTab === "search" && user.role !== "admin" && (
              <JobSearch 
                profile={currentUserProfile} 
                onAddApplication={(app) => {
                  if (!db) return;
                  updateDb({ ...db, applications: [...db.applications, app] });
                  setActiveTab("tracker");
                }}
              />
            )}
            
            {activeTab === "tracker" && user.role !== "admin" && (
              <Tracker 
                user={user}
                applications={userApplications} 
                onUpdate={(apps) => {
                  if (!db) return;
                  const otherApps = db.applications.filter(a => a.userId !== user.id);
                  updateDb({ ...db, applications: [...otherApps, ...apps] });
                }}
              />
            )}
            
            {activeTab === "ai" && user.role !== "admin" && (
              <AIAssistant user={user} profile={currentUserProfile} />
            )}
            
            {activeTab === "admin" && user.role === "admin" && (
              <AdminPanel 
                db={db!} 
                onUpdate={updateDb} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
