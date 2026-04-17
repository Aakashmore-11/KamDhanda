import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../customHooks/useAuth';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    MessageSquare,
    BookOpen,
    LogOut,
    Menu,
    X,
    IndianRupee
} from 'lucide-react';
import axios from 'axios';
import { serverObj } from '../config/serverConfig';
import { handleSuccessMsg } from '../config/toast';

const AdminLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        try {
            const res = await axios.get(`${serverObj.serverAPI}/user/logoutUser`, {
                withCredentials: true,
            });
            handleSuccessMsg(res.data.message);
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    const navLinks = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
        { name: 'Projects', path: '/admin/projects', icon: <Briefcase size={20} /> },
        { name: 'Jobs', path: '/admin/jobs', icon: <Briefcase size={20} className="rotate-12" /> },
        { name: 'Skills', path: '/admin/skills', icon: <BookOpen size={20} /> },
        { name: 'Reported Chats', path: '/admin/chats', icon: <MessageSquare size={20} /> },
        { name: 'Payments', path: '/admin/payments', icon: <IndianRupee size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`flex flex-col bg-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                    } z-20`}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
                            <Briefcase className="text-indigo-500" />
                            <span>KamDhanda</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Profile Widget */}
                <div className={`p-4 border-b border-slate-800 flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden shrink-0">
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Admin" className="h-full w-full object-cover" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "Admin")}&background=random`;
                            }} />
                        ) : (
                            user?.fullName?.charAt(0).toUpperCase() || "A"
                        )}
                    </div>
                    {sidebarOpen && (
                        <div className="overflow-hidden">
                            <p className="font-medium text-sm text-slate-200 truncate">{user?.fullName}</p>
                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Admin</p>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end={link.path === '/admin'}
                            title={!sidebarOpen ? link.name : undefined}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }
                                ${!sidebarOpen && 'justify-center'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                                        {link.icon}
                                    </span>
                                    {sidebarOpen && <span className="font-medium">{link.name}</span>}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        title={!sidebarOpen ? "Logout" : undefined}
                        className={`
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full
                            text-red-400 hover:bg-red-500/10 hover:text-red-300
                            ${!sidebarOpen && 'justify-center'}
                        `}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar for mobile - optional, but keeping it clean for admin */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
