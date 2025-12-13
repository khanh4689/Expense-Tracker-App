import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  BarChart3,
  Settings,
} from "lucide-react";
import { getUserData } from "../utils/auth";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const location = useLocation();
  const userData = getUserData();

  const menuItems = [
    { id: "/", icon: LayoutDashboard, label: "Dashboard" },
    { id: "/add", icon: PlusCircle, label: "Add Transaction" },
    { id: "/transactions", icon: List, label: "Transaction List" },
    { id: "/reports", icon: BarChart3, label: "Reports" },
    { id: "/budget", icon: Settings, label: "Budget Settings" },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.username) return "U";
    return userData.username.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 bg-white shadow-xl flex flex-col">
      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-gray-400 px-4 mb-3">
          Main Menu
        </h3>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;

          return (
            <Link
              key={item.id}
              to={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? "bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>

              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t space-y-3">
        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {userData?.username || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userData?.email || "user@example.com"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}

