import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, UserPlus, Search,
    FileText, LogOut, Menu, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
            }`
        }
    >
        {({ isActive }) => (
            <>
                {isActive && (
                    <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-xl bg-blue-50 border border-blue-200"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                <span className="relative z-10 text-sm">{label}</span>
                {isActive && <div className="ml-auto relative z-10 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
            </>
        )}
    </NavLink>
);

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/register', icon: UserPlus, label: 'Register Child' },
        { to: '/search', icon: Search, label: 'AI Search' },
        { to: '/reports', icon: FileText, label: 'Reports' },
    ];

    const pageTitle = location.pathname.replace('/', '').replace('-', ' ') || 'Home';

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4ff' }}>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 lg:hidden bg-slate-900/30 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className="p-5 flex items-center gap-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
                        <ShieldAlert className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-800 tracking-tight">MCIS</h1>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500">AI Identification</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item, i) => (
                        <motion.div
                            key={item.to}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                        >
                            <SidebarItem {...item} onClick={() => setIsSidebarOpen(false)} />
                        </motion.div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium group"
                    >
                        <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-3">
                        <button className="p-1.5 lg:hidden text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden lg:flex items-center gap-1.5 text-sm">
                            <span className="text-slate-400">Pages</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-700 capitalize font-semibold">{pageTitle}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">Administrator</p>
                            <p className="text-xs text-slate-400">Active Session</p>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                            AD
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
