import React, { useEffect, useState } from "react";
import { Search, Briefcase, MapPin, Rocket, Star, PieChart, MoveRight, PencilRuler, Code2, PenSquare, Laptop, User2Icon, AlignHorizontalJustifyStartIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import ProjectCard from "../../components/seeker/ProjectCard";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import { useSelector } from "react-redux";
import { FiZap } from "react-icons/fi";
import { motion } from "framer-motion";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const serverAPI = serverObj.serverAPI;
  const { currentMode } = useSelector(state => state.app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching projects from:", `${serverAPI}/freelancerProject/get-allProjects`);
        const projRes = await axios.get(`${serverAPI}/freelancerProject/get-allProjects`, { withCredentials: true });
        console.log("Projects fetched:", projRes.data?.length);
        setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }

      try {
        const jobsRes = await axios.get(`${serverAPI}/jobs`, { withCredentials: true });
        setJobs(jobsRes.data?.jobs || []);
      } catch (err) { }

      try {
        const appliedRes = await axios.get(`${serverAPI}/applications/seeker`, { withCredentials: true });
        setAppliedJobs(appliedRes.data?.applications || []);
      } catch (err) { }
    };
    fetchData();
  }, [serverAPI]);

  const allCategory = [
    { icon: <PencilRuler />, name: "Design", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: <Code2 />, name: "Dev", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <PenSquare />, name: "Writing", color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: <Briefcase />, name: "Marketing", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: <Laptop />, name: "Admin", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: <PieChart />, name: "Data", color: "text-cyan-500", bg: "bg-cyan-50" },
    { icon: <User2Icon />, name: "Support", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: <AlignHorizontalJustifyStartIcon />, name: "Sales", color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen pb-12 pt-6 select-none w-full overflow-hidden bg-slate-50">

      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40 overflow-hidden">
        <div className="w-[500px] h-[500px] bg-indigo-300 rounded-full blur-[120px] absolute -top-40 right-10 mix-blend-multiply opacity-20"></div>
        <div className="w-[400px] h-[400px] bg-purple-300 rounded-full blur-[100px] absolute top-40 -left-20 mix-blend-multiply opacity-20"></div>
      </div>

      <div className="relative z-10">
        {/* ===== HERO SECTION ===== */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="text-center mb-16 pt-10">
          <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
            {projects.length} Total Opportunities Available
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Work & Career, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Elevated.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            KamDhanda is the modern platform for elite talent. Connect with top opportunities, track applications, and grow your career without friction.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Rocket size={24} /></div>
              <div className="text-left">
                <p className="text-xl font-extrabold text-slate-900">1.2k+</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Active {currentMode === 'Freelance' ? 'Gigs' : 'Jobs'}</p>
              </div>
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Star size={24} /></div>
              <div className="text-left">
                <p className="text-xl font-extrabold text-slate-900">4.9/5</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">User Rating</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ===== UNIFIED ACTIVITY TRACKERS ===== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {/* Freelance Tracker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Briefcase size={16} /></div>
                Freelance Activity
              </h2>
              <NavLink to="/seeker/applied-projects" className="text-xs text-indigo-600 font-bold hover:underline bg-indigo-50 px-3 py-1 rounded-full">View All</NavLink>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 2).map(project => (
                <div key={project._id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[150px] md:max-w-[200px]">{project.title}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">{project.status}</span>
                </div>
              ))}
              {projects.length === 0 && <div className="text-center py-6 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl">No active freelance projects.</div>}
            </div>
          </div>

          {/* Job Applications Tracker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><FiZap size={16} /></div>
                Job Applications
              </h2>
              <NavLink to="/seeker/my-applications" className="text-xs text-emerald-600 font-bold hover:underline bg-emerald-50 px-3 py-1 rounded-full">View All</NavLink>
            </div>
            <div className="space-y-3">
              {appliedJobs.slice(0, 2).map(app => (
                <div key={app._id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[150px] md:max-w-[200px]">{app.jobId?.title || "Job Listing"}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm ${app.status === 'Shortlisted' ? 'text-emerald-700 border-emerald-200' : 'text-slate-600'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
              {appliedJobs.length === 0 && <div className="text-center py-6 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl">No job applications yet.</div>}
            </div>
          </div>
        </motion.div>

        {/* ===== CATEGORIES ===== */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Explore By <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Category</span>
            </h1>
            <NavLink to={currentMode === 'Freelance' ? "/seeker/findProjects" : "/seeker/find-jobs"} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
              Browse All <MoveRight className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {allCategory.map((cat, i) => (
              <motion.div whileHover={{ y: -5 }} key={i} className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform mb-4`}>
                  {cat.icon}
                </div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{cat.name}</h2>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== FEATURED RECOMMENDS ===== */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {currentMode === 'Freelance' ? 'Featured Freelance Work' : 'Latest Job Openings'}
            </h1>
            <NavLink to={currentMode === 'Freelance' ? "/seeker/findProjects" : "/seeker/find-jobs"} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
              See All Opportunities <MoveRight className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMode === 'Freelance' ? (
              projects.slice(0, 3).map((project) => (
                <ProjectCard
                  project={project}
                  key={project._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                />
              ))
            ) : (
              jobs.slice(0, 3).map((job) => (
                <div key={job._id} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Briefcase size={24} /></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">{job.jobType}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-2">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mb-6">
                    <MapPin size={16} className="text-slate-400" /> {job.location}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                    {job.requiredSkills?.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills?.length > 3 && (
                      <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2.5 py-1 rounded-lg">+{job.requiredSkills.length - 3}</span>
                    )}
                  </div>

                  <NavLink to={`/seeker/job/${job._id}`} className="block w-full text-center py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200">
                    Apply Now
                  </NavLink>
                </div>
              ))
            )}

            {((currentMode === 'Freelance' && projects.length === 0) || (currentMode === 'JobPortal' && jobs.length === 0)) && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No opportunities found right now.<br />Check back later!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
