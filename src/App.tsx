import { useState, useEffect } from "react";
import { User, Database, Profile, JobApplication } from "./types";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import AdminPanel from "./components/AdminPanel";
import ProfilePage from "./components/ProfilePage";
import Tracker from "./components/Tracker";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [db, setDb] = useState<Database | null>(null);
  const [activeTab, setActiveTab] = useState("tracker");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

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
    // Only redirect if a non-admin tries to view the admin tab or if legacy tab is selected
    if (user && user.role !== "admin" && activeTab === "admin") {
      setActiveTab("tracker");
    } else if (activeTab === "search" || activeTab === "ai") {
      setActiveTab("tracker");
    }
  }, [user?.role, activeTab]);

  const handleLogin = (u: User) => {
    setUser(u);
    setActiveTab(u.role === "admin" ? "admin" : "tracker");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("tracker");
  };

  const updateDb = async (newDb: Database) => {
    setDb(newDb);
    if (user) {
      const updatedSelf = newDb.users.find((u) => u.id === user.id);
      if (updatedSelf) {
        setUser((prev) => (prev ? { ...prev, ...updatedSelf } : null));
      }
    }
    await fetch("/api/db/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDb),
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login users={db?.users || []} onLogin={handleLogin} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
  }

  const currentUserProfile = db?.profiles.find((p) => p.userId === user.id);
  const userApplications = db?.applications.filter((a) => a.userId === user.id) || [];

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300`}>
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
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
            {activeTab === "profile" && (
              <ProfilePage 
                user={user} 
                profile={currentUserProfile} 
                onSave={(p) => {
                  if (!db) return;
                  const newProfiles = db.profiles.filter(pr => pr.userId !== user.id);
                  updateDb({ ...db, profiles: [...newProfiles, p] });
                }}
                onUpdateAccount={async (acc) => {
                  if (!db) return;
                  const newUsers = db.users.map((u) => {
                    if (u.id === user.id) {
                      return {
                        ...u,
                        ...(acc.geminiApiKey !== undefined ? { geminiApiKey: acc.geminiApiKey } : {}),
                        ...(acc.password ? { password: acc.password } : {}),
                      };
                    }
                    return u;
                  });
                  await updateDb({ ...db, users: newUsers });
                }}
              />
            )}
            
            {activeTab === "tracker" && (
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
            
            {activeTab === "admin" && user.role === "admin" && (
              <AdminPanel 
                db={db!} 
                currentUser={user}
                onUpdate={updateDb} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

