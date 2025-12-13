import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 transition-all duration-300">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
