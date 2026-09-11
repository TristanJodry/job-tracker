import React from "react";
import { LayoutDashboard, UserCircle, Search, Sparkles, Settings, LogOut, Briefcase } from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = user.role === "admin" 
    ? [{ id: "admin", label: "Administration", icon: Settings }]
    : [
        { id: "tracker", label: "Candidatures", icon: LayoutDashboard },
        { id: "search", label: "Recherche", icon: Search },
        { id: "profile", label: "Mon Profil", icon: UserCircle },
        { id: "ai", label: "Assistant IA", icon: Sparkles },
      ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Briefcase size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">JobTracker</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
