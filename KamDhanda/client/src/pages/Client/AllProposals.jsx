import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  HandshakeIcon,
  Calendar,
  IndianRupee,
  ChevronRight,
  Briefcase,
  Target,
  ArrowUpRight,
  Sparkles,
  Users,
} from "lucide-react";
import { serverObj } from "../../config/serverConfig";
import axios from "axios";
import Loader from "../../components/common/Loader";
import useAuth from "../../customHooks/useAuth";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AllProposals = () => {
  const serverAPI = serverObj.serverAPI;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAppliedForm = async () => {
      try {
        const res = await axios.get(
          `${serverAPI}/freelancerProject/get-projects`,
          {
            withCredentials: true,
          }
        );
        // We show all projects but highlight those with proposals
        const sortedProjects = [...res.data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching project proposals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAppliedForm();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          label: "Mission Success",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: "from-emerald-400 to-teal-600",
          bg: "bg-emerald-50/50",
          border: "border-emerald-100",
          text: "text-emerald-600",
        };
      case "Paid":
        return {
          label: "Paid & Locked",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: "from-indigo-400 to-indigo-600",
          bg: "bg-indigo-50/50",
          border: "border-indigo-100",
          text: "text-indigo-600",
        };
      case "Assigned":
        return {
          label: "In Progress",
          icon: <HandshakeIcon className="w-3.5 h-3.5" />,
          color: "from-blue-400 to-indigo-600",
          bg: "bg-blue-50/50",
          border: "border-blue-100",
          text: "text-blue-600",
        };
      default:
        return {
          label: "Recruiting",
          icon: <Clock className="w-3.5 h-3.5" />,
          color: "from-amber-400 to-orange-500",
          bg: "bg-amber-50/50",
          border: "border-amber-100",
          text: "text-amber-600",
        };
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen pb-20 select-none w-full bg-slate-50 relative overflow-hidden">
      {/* Background Depth */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
        <div className="w-[800px] h-[800px] bg-indigo-100 rounded-full blur-[140px] absolute -top-40 right-10"></div>
        <div className="w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] absolute top-40 -left-20"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <header className="mb-12">
            <div className="inline-flex items-center px-4 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                <Target className="w-3 h-3 mr-2" /> Management Console
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Project & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">Proposal Pulse</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                Centralized oversight for your ongoing initiatives. Track talent submissions, 
                monitor engagement levels, and orchestrate project success.
            </p>
        </header>

        {/* Projects List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {projects.map((project, index) => {
              const status = getStatusConfig(project.status);
              const proposalCount = project.proposals?.length || 0;

              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-200/60 hover:border-indigo-200/80 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden"
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${status.color}`}></div>

                  <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.border} ${status.text}`}>
                          {status.icon} {status.label}
                        </span>
                        <span className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                          <Calendar className="w-3 h-3" /> Created {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        {proposalCount > 0 && (
                          <span className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                            <Users className="w-3 h-3" /> {proposalCount} Submissions
                          </span>
                        )}
                      </div>

                      <div className="max-w-3xl">
                        <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-slate-500 font-medium text-sm line-clamp-2 md:line-clamp-1">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 w-full lg:w-auto flex flex-col md:flex-row lg:flex-col justify-between items-end gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="p-2 bg-indigo-50 rounded-xl">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Valuation</p>
                          </div>
                      
                          <p className="text-2xl font-black text-slate-900 flex items-center justify-end">
                              <IndianRupee className="w-4 h-4 mr-1 text-slate-300" />
                              {project.minBudget.toLocaleString("en-IN")} - {project.maxBudget.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 opacity-60">
                              Budget Model: {project.budgetType}
                          </p>
                      </div>

                      <div className="flex w-full lg:w-auto justify-end">
                        <Link
                          to={`${project._id}`}
                          className="w-full lg:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
                        >
                          View Talent Pool <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-20 text-center bg-white rounded-[4.5rem] border-2 border-dashed border-slate-200 shadow-inner"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Briefcase className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">No Active Ventures</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
              Your dashboard is ready for its first project. Deploy a brief and start attracting world-class talent.
            </p>
            <Link
              to="/client/create-newProject"
              className="inline-flex items-center px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
            >
              Initialize New Project <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllProposals;
