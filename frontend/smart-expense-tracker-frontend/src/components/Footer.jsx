import React from "react";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo + Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm">Smart Expense Tracker</p>
              <p className="text-xs text-blue-200">© 2024 All rights reserved</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-blue-200 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">
              Support
            </a>
          </div>

          {/* Version */}
          <div className="text-sm text-blue-200">
            Version 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}
