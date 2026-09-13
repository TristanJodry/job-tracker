import React from "react";
import { LayoutDashboard, UserCircle, Settings, LogOut, Briefcase, Sun, Moon } from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, isDarkMode, onToggleDarkMode }: SidebarProps) {
  const menuItems = [
    { id: "tracker", label: "Candidatures", icon: LayoutDashboard },
    { id: "profile", label: "Mon Profil", icon: UserCircle },
    ...(user.role === "admin" ? [{ id: "admin", label: "Administration", icon: Settings }] : []),
  ];

  return (
    <aside className={`w-64 flex flex-col h-screen sticky top-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border-r`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Briefcase size={24} />
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>JobTracker</h1>
        </div>
        <button 
          onClick={onToggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-yellow-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? (isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600")
                : (isDarkMode ? "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}>
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.username}</p>
            <p className={`text-xs capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
