import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../customHooks/useAuth";
import { FiX, FiBriefcase, FiUsers, FiFileText, FiSearch, FiUser, FiZap, FiVideo } from "react-icons/fi";
import { RiMenu4Line } from "react-icons/ri";
import { Home, MessageSquare } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import { useSelector, useDispatch } from "react-redux";
import { toggleMode } from "../../store/slices/appSlice";
import { motion, AnimatePresence } from "framer-motion";

const Nav = () => {
  const { role, user } = useAuth();
  const { currentMode } = useSelector(state => state.app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close sidebar on navigation change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleModeToggle = () => {
    dispatch(toggleMode());
    if (role?.toLowerCase() === "admin") return;
    const baseRoute = role?.toLowerCase() === "seeker" ? "/seeker" : "/client";
    navigate(baseRoute);
  };

  const getLinks = () => {
    const isJobPortal = currentMode === 'JobPortal';

    const links = {
      Seeker: isJobPortal ? [
        { name: "Dashboard", to: "/seeker", icon: <Home size={18} /> },
        { name: "Find Jobs", to: "/seeker/find-jobs", icon: <FiSearch size={18} /> },
        { name: "Applications", to: "/seeker/my-applications", icon: <FiFileText size={18} /> },
        { name: "Interviews", to: "/seeker/interviews", icon: <FiVideo size={18} /> },
      ] : [
        { name: "Dashboard", to: "/seeker", icon: <Home size={18} /> },
        { name: "Find Projects", to: "/seeker/findProjects", icon: <FiSearch size={18} /> },
        { name: "My Work", to: "/seeker/applied-projects", icon: <FiFileText size={18} /> },
        { name: "Transactions", to: "/seeker/transactions", icon: <FiZap size={18} /> },
      ],
      Client: isJobPortal ? [
        { name: "Dashboard", to: "/client", icon: <Home size={18} /> },
        { name: "Post Job", to: "/client/post-job", icon: <FiZap size={18} /> },
        { name: "Manage Jobs", to: "/client/manage-jobs", icon: <FiBriefcase size={18} /> },
        { name: "Interviews", to: "/client/interviews", icon: <FiVideo size={18} /> },
      ] : [
        { name: "Dashboard", to: "/client", icon: <Home size={18} /> },
        { name: "Post Project", to: "/client/create-newProject", icon: <FiFileText size={18} /> },
        { name: "Proposals", to: "/client/allProposals", icon: <FiUsers size={18} /> },
        { name: "Transactions", to: "/client/transactions", icon: <FiZap size={18} /> },
      ],
      Admin: [
        { name: "Dashboard", to: "/admin", icon: <Home size={18} /> },
        { name: "Users", to: "/admin/users", icon: <FiUsers size={18} /> },
        { name: "Projects", to: "/admin/projects", icon: <FiBriefcase size={18} /> },
        { name: "Payments", to: "/admin/payments", icon: <FiZap size={18} /> },
        { name: "Chats", to: "/admin/chats", icon: <MessageSquare size={18} /> },
      ],
    };

    return links[role] || (role?.toLowerCase() === "admin" ? links.Admin : links.Seeker);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = getLinks();

  return (
    <>
      {/* Main Navigation Bar */}
      <nav
        className={`w-full h-[80px] transition-all duration-300 select-none z-40 fixed top-0 left-0 ${
          scrolled 
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm" 
            : "bg-white/50 backdrop-blur-lg border-b border-transparent"
        }`}
      >
        <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 h-full flex justify-between items-center">
          
          {/* Logo & Mode Toggle */}
          <div className="flex items-center gap-6">
            <NavLink
              to={role?.toLowerCase() === "admin" ? "/admin" : (role?.toLowerCase() === "seeker" ? "/seeker" : "/client")}
              className="flex items-center gap-2.5 group"
            >
              <img
                src="/Logo.png"
                alt="KamDhanda Logo"
                className="h-7 w-7 transition-transform group-hover:scale-105"
              />
              <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500 tracking-tight">
                KamDhanda
              </h1>
            </NavLink>

            {/* Desktop Mode Toggle */}
            {role?.toLowerCase() !== "admin" && (
              <div className="hidden lg:flex items-center bg-slate-100/80 rounded-xl p-1 border border-slate-200/50">
                <button
                  onClick={handleModeToggle}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currentMode === 'Freelance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  Freelance
                </button>
                <button
                  onClick={handleModeToggle}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currentMode === 'JobPortal' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  Jobs
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              {links.map((link, i) => {
                 let isActive = location.pathname === link.to;
                 if(link.name === "Dashboard" && (location.pathname === "/seeker/" || location.pathname === "/client/")) {
                    isActive = true;
                 }
                 return (
                  <NavLink
                    key={i}
                    to={link.to}
                    end={link.name === "Dashboard"}
                    className={`relative px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </NavLink>
                 )
              })}
            </div>

            {user && (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <NotificationsDropdown />
                <NavLink
                  to={role?.toLowerCase() === "admin" ? "/admin" : (role?.toLowerCase() === "seeker" ? "/seeker/profile" : "/client/profile")}
                  className="hidden sm:block group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-transparent group-hover:border-indigo-100 transition-all overflow-hidden p-0.5">
                    <img
                      src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                      alt={user?.fullName?.slice(0, 1)}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
                      }}
                    />
                  </div>
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden bg-slate-100 p-2 rounded-xl text-slate-600 hover:bg-slate-200 focus:outline-none transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <FiX size={24} /> : <RiMenu4Line size={24} />}
          </button>
        </div>
      </nav>

      {/* spacer to prevent content from going under the fixed nav */}
      <div className="w-full h-[80px]"></div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white shadow-2xl z-50 flex flex-col md:hidden"
            >
              {/* Sidebar Header */}
              <div className="flex justify-between items-center h-[80px] px-6 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 text-lg">Menu</span>
                <button
                  className="bg-slate-100 p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Mode Toggle (Mobile) */}
              {role?.toLowerCase() !== "admin" && (
                <div className="px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => { handleModeToggle(); setIsSidebarOpen(false); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${currentMode === 'Freelance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                      Freelance
                    </button>
                    <button
                      onClick={() => { handleModeToggle(); setIsSidebarOpen(false); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${currentMode === 'JobPortal' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                    >
                      Jobs
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                {links.map((link, i) => (
                  <NavLink
                    key={i}
                    to={link.to}
                    end={link.name === "Dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    <span className="opacity-70">{link.icon}</span>
                    <span>{link.name}</span>
                  </NavLink>
                ))}
              </div>

              {/* Mobile Profile Block */}
              {user && (
                <div className="p-4 border-t border-slate-100">
                  <NavLink
                    to={role?.toLowerCase() === "admin" ? "/admin" : (role?.toLowerCase() === "seeker" ? "/seeker/profile" : "/client/profile")}
                    className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl hover:bg-slate-100 transition-colors group"
                  >
                    <img
                      src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs font-medium text-slate-500 truncate capitalize">{role}</p>
                    </div>
                  </NavLink>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
