import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import useAuth from "../../customHooks/useAuth";
import { ChevronLeft, Code2Icon, WandSparklesIcon, MapPin, IndianRupee, Calendar, User, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const ProjectDetail = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const colors = [
    "bg-rose-500", "bg-emerald-500", "bg-indigo-500", "bg-sky-500", "bg-amber-500", "bg-purple-500"
  ];
  const [randomColor] = useState(colors[Math.floor(Math.random() * colors.length)]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${serverObj.serverAPI}/freelancerProject/${id}`,
          { withCredentials: true }
        );
        setProject(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const hasApplied = project?.proposals?.some(
    (proposal) => proposal.seeker_id === user?._id || proposal.seeker_id?._id === user?._id
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      );
  }

  if (!project) return <div className="text-center py-20 font-bold text-slate-500">Project not found</div>;

  return (
    <div className="min-h-screen pb-12 select-none w-full bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
        <div className="w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[100px] absolute -top-40 right-10"></div>
      </div>

      <div className="relative z-10 w-full py-8 pt-6">
        
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-6 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </button>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex gap-4">
                        <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-white text-2xl font-black ${randomColor} shadow-md`}>
                            {project.title?.charAt(0) || "P"}
                        </div>
                        <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="inline-flex px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg">
                                    {project.category}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border rounded-lg
                                ${project.status === "Open" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                  project.status === "Assigned" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                  project.status === "Paid" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                  "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                    {project.status === "Open" ? <CheckCircle size={12} /> : 
                                     project.status === "Paid" ? <CheckCircle size={12} /> :
                                     <Clock size={12} />}
                                    {project.status === "Paid" ? "Paid & Locked" : project.status}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                                {project.title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Posted</p>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Location</p>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> Remote</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Budget ({project.budgetType})</p>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <IndianRupee size={14} className="text-slate-400"/> 
                            {project.budgetType === "Fixed" 
                                ? `${project.minBudget?.toLocaleString('en-IN')} - ${project.maxBudget?.toLocaleString('en-IN')}` 
                                : `${project.minBudget?.toLocaleString('en-IN')} - ${project.maxBudget?.toLocaleString('en-IN')} / hr`}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Description Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <WandSparklesIcon size={20} className="text-indigo-500" /> Project Details
                </h2>
                <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-medium">
                    {project.description?.split("\n").map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </motion.div>

            {/* Required Skills Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Code2Icon size={20} className="text-emerald-500" /> Expertise Required
                </h2>
                <div className="flex flex-wrap gap-2">
                    {project.skills?.map((skill, index) => (
                        <span key={index} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-slate-50 text-slate-600 border border-slate-200 rounded-lg">
                            {skill}
                        </span>
                    ))}
                </div>
            </motion.div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Action Card */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-100 pb-3">Client Overview</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-xl ${randomColor}`}>
                  {project.client_id?.fullName?.charAt(0) || "C"}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">{project.client_id?.fullName || "Anonymous Client"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Member since {project.client_id?.createdAt ? new Date(project.client_id.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proposals</span>
                    <span className="text-sm font-extrabold text-slate-900">{project.proposals?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</span>
                    <span className="text-sm font-bold text-slate-900">{project.budgetType}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hiring</span>
                    <span className="text-sm font-bold text-indigo-600">{project.assignedFreelancerId ? "Filled" : "Active"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8">
                {role === "Seeker" && project.status === "Open" && !hasApplied && (
                    <Link to={`/seeker/project/${id}/apply-form`}>
                        <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                            Submit a Proposal
                        </button>
                    </Link>
                )}

                {role === "Seeker" && hasApplied && (
                    <Link to={`/seeker/project/${id}/apply-form`}>
                        <button className="w-full py-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                            <CheckCircle size={18} /> Update Your Proposal
                        </button>
                    </Link>
                )}

                {(project.status === "Assigned" || project.status === "Completed") && (
                    <Link to={`/${role.toLowerCase()}/project/${id}/tracking`}>
                        <button className="w-full mt-4 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                            Track Progress
                        </button>
                    </Link>
                )}
              </div>

            </motion.div>

          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;
