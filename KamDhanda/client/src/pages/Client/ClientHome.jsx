import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import ClientProjectCard from "../../components/client/ClientProjectCard";
import { NavLink } from "react-router-dom";
import { Search, Plus, Briefcase, Zap, Star, Activity, Frown } from "lucide-react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const ClientHome = () => {
  const serverAPI = serverObj.serverAPI;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentMode } = useSelector(state => state.app);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverAPI}/freelancerProject/get-projects`, { withCredentials: true });
        res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProjects();
  }, [serverAPI]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const ProjectCardSkeleton = () => (
    <div className="w-full bg-white rounded-3xl p-6 border border-slate-200 animate-pulse">
      <div className="h-10 w-10 bg-slate-100 rounded-xl mb-6"></div>
      <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-slate-50 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-50 rounded w-5/6 mb-6"></div>
      <div className="flex justify-between mt-auto">
        <div className="h-10 bg-slate-100 rounded-xl w-1/3"></div>
        <div className="h-10 bg-slate-100 rounded-xl w-1/4"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12 pt-6 select-none w-full bg-slate-50 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -space-y-32 z-0 opacity-40 mix-blend-multiply">
        <div className="w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[100px] absolute -top-40 -left-20"></div>
        <div className="w-[400px] h-[400px] bg-sky-200 rounded-full blur-[100px] absolute top-40 right-0"></div>
      </div>

      <div className="relative z-10 w-full py-8">
        {/* ===== HERO SECTION ===== */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mb-16 mt-8">
            <motion.div variants={itemVariants} className="inline-flex flex-col md:flex-row md:items-center justify-between w-full mb-8 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  Client Dashboard
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Welcome to your <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Command Center.</span>
                </h1>
              </div>
              <motion.div variants={itemVariants}>
                 <NavLink 
                    to={currentMode === 'Freelance' ? "/client/create-newProject" : "/client/post-job"} 
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all w-fit"
                  >
                    <Plus size={20} />
                    Post New {currentMode === 'Freelance' ? 'Project' : 'Job'}
                 </NavLink>
              </motion.div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Briefcase size={28} /></div>
                  <div>
                      <p className="text-3xl font-extrabold text-slate-900">{projects.length}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Total Posts</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Zap size={28} /></div>
                  <div>
                      <p className="text-3xl font-extrabold text-slate-900">{projects.filter(p => p.status === 'Open').length}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Active Now</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl"><Activity size={28} /></div>
                  <div>
                      <p className="text-3xl font-extrabold text-slate-900">100%</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Hiring Rate</p>
                  </div>
              </div>
            </motion.div>
        </motion.div>

        {/* ===== PROJECT LISTING ===== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 decoration-indigo-200">
              Your Latest Postings
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="w-full bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Search className="text-indigo-400 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm">Tap into our network of top-tier talent by posting your first project or job today.</p>
              <NavLink to="/client/create-newProject" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus size={18} /> Create Your First Post
              </NavLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <ClientProjectCard
                  project={project}
                  key={project._id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientHome;
