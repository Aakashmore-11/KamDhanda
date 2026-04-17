import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import {
  Briefcase,
  Bell,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  XCircle,
  LogOut,
  User2,
  ChevronRight,
  Camera,
  Loader2,
  Zap,
  MapPin,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { handleErrorMsg, handleSuccessMsg } from "../../config/toast";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../../store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const ClientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const serverAPI = serverObj.serverAPI;
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOpenProject: 0,
    totalAssignedProject: 0,
    totalProposals: 0,
    totalJobs: 0,
    totalApplicants: 0
  });

  const fetchAllProjects = async () => {
    try {
      const res = await axios.get(
        `${serverAPI}/freelancerProject/get-projects`,
        {
          withCredentials: true,
        }
      );
      res.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProjects(res.data);
    } catch (err) {
      handleErrorMsg("Failed to load projects. Please try again later.");
    }
  };

  const fetchAllJobs = async () => {
    try {
      const res = await axios.get(`${serverAPI}/jobs/employer`, { withCredentials: true });
      setJobs(res.data.jobs);
    } catch (err) {
      console.error("Failed to load jobs");
    }
  };

  useEffect(() => {
    fetchAllProjects();
    fetchAllJobs();
  }, []);

  useEffect(() => {
    const calculateStats = () => {
      const stats = {
        totalOpenProject: 0,
        totalAssignedProject: 0,
        totalProposals: 0,
      };

      projects.forEach((e) => {
        if (e.status === "Open") stats.totalOpenProject++;
        if (e.status === "Assigned") stats.totalAssignedProject++;
        if (e.proposals?.length > 0) stats.totalProposals += e.proposals.length;
      });

      stats.totalJobs = jobs.length;
      
      setStats(stats);
    };

    calculateStats();
  }, [projects, jobs]);

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${serverObj.serverAPI}/user/logoutUser`, {
        withCredentials: true,
      });
      handleSuccessMsg(res.data.message);
      navigate("/login");
    } catch (err) {
      handleErrorMsg(err.message);
    }
  };

  const statusCard = [
    {
      name: "Total Projects",
      icon: <Briefcase className="text-indigo-600" size={18} />,
      value: projects.length,
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      name: "Open Roles",
      icon: <Clock className="text-sky-600" size={18} />,
      value: stats.totalOpenProject,
      bg: "bg-sky-50",
      border: "border-sky-100"
    },
    {
      name: "Proposals",
      icon: <User2 className="text-emerald-600" size={18} />,
      value: stats.totalProposals,
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      name: "Active Jobs",
      icon: <Zap className="text-amber-600" size={18} />,
      value: stats.totalJobs,
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
  ];

  const handleCloseProject = async (projectId) => {
    try {
      const res = await axios.delete(
        `${serverObj.serverAPI}/freelancerProject/close-project`,
        {
          withCredentials: true,
          headers: { projectId },
        }
      );
      handleSuccessMsg(res.data.message);
      setProjects((prev) => prev.filter((e) => e._id !== projectId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      handleErrorMsg("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);

    setIsUpdating(true);
    try {
      const res = await axios.patch(
        `${serverObj.serverAPI}/user/update-profile-pic`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      handleSuccessMsg("Profile picture updated!");

      if (res.data?.user) {
        dispatch(addUser({ user: res.data.user, role: user.role }));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      handleErrorMsg(error.response?.data?.message || "Failed to upload picture");
    } finally {
      setIsUpdating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const getInitials = (name) => {
    if (!name) return "G";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen pb-12 select-none w-full bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
        <div className="w-[600px] h-[600px] bg-indigo-200 rounded-full blur-[120px] absolute -top-40 right-10"></div>
        <div className="w-[400px] h-[400px] bg-emerald-200 rounded-full blur-[100px] absolute top-40 -left-20"></div>
      </div>

      <div className="relative z-10 w-full py-8 pt-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* Header Card */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="h-28 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900"></div>
            
            <div className="px-6 sm:px-10 pb-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start justify-between -mt-10 relative">
                
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                  {/* Avatar */}
                  <div className="relative group shrink-0">
                    <div className="h-24 w-24 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100">
                      <div className="h-full w-full rounded-xl bg-slate-100 overflow-hidden relative">
                        {user?.profilePic ? (
                          <img src={user.profilePic} className="h-full w-full object-cover" alt="Profile" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-2xl font-black text-indigo-500">
                            {getInitials(user?.fullName)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-xl cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          {isUpdating ? <Loader2 size={24} className="animate-spin text-white" /> : <Camera size={24} className="text-white" />}
                        </div>
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>

                  {/* Name Info */}
                  <div className="text-center sm:text-left pt-2 sm:pt-0">
                    <h1 className="text-2xl font-extrabold text-slate-900">
                      Hi, {user?.fullName || "Guest"}!
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                        <ShieldCheck size={12} /> {user?.role} Dashboard
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full sm:w-auto gap-3 pt-4 sm:pt-14 justify-center">
                  <button onClick={handleLogout} className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-white text-rose-500 rounded-xl hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all font-bold text-sm flex active:scale-95">
                    <LogOut size={16} /> Logout
                  </button>
                  <Link to={"/client/create-newProject"} className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all font-bold text-sm flex active:scale-95 whitespace-nowrap">
                    <Briefcase size={16} /> Post Project
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statusCard.map((status, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-2xl border ${status.bg} ${status.border} shrink-0`}>
                  {status.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status.name}</p>
                  <p className="text-2xl font-black text-slate-900">{status.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Projects */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase size={20} className="text-indigo-600" />
                  Recent Projects
                </h2>
                <Link to={"/client"} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                  View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="p-4 flex-1">
                <div className="space-y-3">
                  {projects.slice(0, 4).map((project) => (
                    <div key={project._id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                      <div>
                        <h3 className="font-extrabold text-slate-800 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                              project.status === "Open" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                            }`}>
                            {project.status}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {project.proposals.length} Proposals
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-start sm:self-auto shrink-0">
                        <Link to={`/client/allProposals/${project._id}`} className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                          View
                        </Link>
                        <button onClick={() => handleCloseProject(project._id)} className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors">
                          Close
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Briefcase size={20} />
                      </div>
                      <p className="text-sm font-bold text-slate-500">No active projects.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Jobs */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap size={20} className="text-amber-500" />
                  Recent Job Postings
                </h2>
                <Link to={"/client/manage-jobs"} className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group">
                  Manage Jobs <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="p-4 flex-1">
                <div className="space-y-3">
                  {jobs.slice(0, 4).map((job) => (
                    <div key={job._id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                      <div>
                        <h3 className="font-extrabold text-slate-800 line-clamp-1 mb-2 group-hover:text-amber-600 transition-colors">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">{job.jobType}</span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                        </div>
                      </div>
                      <Link to={`/client/job-applications/${job._id}`} className="px-4 py-2 self-start sm:self-auto shrink-0 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
                        View Applicants
                      </Link>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Zap size={20} />
                      </div>
                      <p className="text-sm font-bold text-slate-500">No active job postings.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

          </div>

        </motion.div>
      </div>

    </div>
  );
};

export default ClientDashboard;
