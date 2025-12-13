import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  User,
  LogOut,
  Menu,
} from "lucide-react";

export default function Header({ onToggleSidebar }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { id: "/", icon: LayoutDashboard, label: "Dashboard" },
    { id: "/transactions", icon: Receipt, label: "Transactions" },
    { id: "/reports", icon: BarChart3, label: "Reports" },
    { id: "/profile", icon: User, label: "Profile" },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Toggle Sidebar */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">Smart Expense</h1>
                <p className="text-xs text-blue-200">Track & Save</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;

              return (
                <Link
                  key={item.id}
                  to={item.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-blue-900 shadow-lg"
                      : "hover:bg-blue-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors ml-2"
              title={`Logout ${user?.username || ""}`}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Logout</span>
            </button>
          </nav>

          {/* Mobile Profile Button */}
          <Link
            to="/profile"
            className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <User className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
