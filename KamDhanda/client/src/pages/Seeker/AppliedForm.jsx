import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  ChevronRight,
  Briefcase,
  Calendar,
  User,
  ArrowUpRight,
  Target,
  Zap,
} from "lucide-react";
import { serverObj } from "../../config/serverConfig";
import axios from "axios";
import Loader from "../../components/common/Loader";
import useAuth from "../../customHooks/useAuth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReviewTest from "../../components/HiringWorkflow/ReviewTest";
import { FiTrendingUp, FiX } from "react-icons/fi";

const AppliedForm = () => {
  const serverAPI = serverObj.serverAPI;
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const fetchAllAppliedForm = async () => {
      try {
        const res = await axios.get(`${serverAPI}/user/get-allAppliedForm`, {
          withCredentials: true,
        });
        if (res.data && res.data.appliedForm) {
          const sorted = [...res.data.appliedForm].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAppliedJobs(sorted);
        }
      } catch (error) {
        console.error("Error fetching applied forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAppliedForm();
  }, []);

  const getStatus = (status) => {
    const statusConfig = {
      Pending: {
        name: "Under Review",
        icon: <Clock className="w-3.5 h-3.5" />,
        color: "from-amber-400 to-orange-500",
        bg: "bg-amber-50/50",
        border: "border-amber-100",
        text: "text-amber-600",
      },
      Rejected: {
        name: "Declined",
        icon: <XCircle className="w-3.5 h-3.5" />,
        color: "from-rose-400 to-red-600",
        bg: "bg-rose-50/50",
        border: "border-rose-100",
        text: "text-rose-500",
      },
      Accepted: {
        name: "Project Won",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        color: "from-emerald-400 to-teal-600",
        bg: "bg-emerald-50/50",
        border: "border-emerald-100",
        text: "text-emerald-600",
      },
      default: {
        name: status || "Submitted",
        icon: <Zap className="w-3.5 h-3.5" />,
        color: "from-indigo-400 to-purple-600",
        bg: "bg-indigo-50/50",
        border: "border-indigo-100",
        text: "text-indigo-600",
      },
    };
    return statusConfig[status] || statusConfig.default;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen pb-20 select-none w-full bg-slate-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
        <div className="w-[800px] h-[800px] bg-indigo-200 rounded-full blur-[140px] absolute -top-40 right-10 animate-blob"></div>
        <div className="w-[600px] h-[600px] bg-emerald-200 rounded-full blur-[120px] absolute top-40 -left-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <header className="mb-12">
            <div className="inline-flex items-center px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Target className="w-3 h-3 mr-2" /> Application Tracker
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Your Freelance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">Trajectory</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                Monitor every pitch and proposal. From initial submission to the final project handover, 
                track your professional growth in real-time.
            </p>
        </header>

        {/* Applications List */}
        <div className="grid grid-cols-1 gap-6">
          {appliedJobs.map((job, index) => {
            const seeker = job.proposals?.find(
              (s) => s.seeker_id === user._id
            );
            const status = getStatus(seeker?.status);

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={job._id}
                className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-200/60 hover:border-indigo-200/80 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${status.color}`}></div>

                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.border} ${status.text}`}>
                        {status.icon} {status.name}
                      </span>
                      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> Submitted {seeker?.appliedAt ? new Date(seeker.appliedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-slate-600 font-bold text-sm">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mr-3 border border-indigo-100">
                            <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        {job.client_id?.fullName || "Verified Client"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skills?.slice(0, 5).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border border-slate-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 w-full lg:w-auto flex flex-col md:flex-row lg:flex-col justify-between items-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right w-full lg:min-w-[180px]">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Proposed Rate</p>
                            <p className="text-xl font-black text-slate-900 flex items-center justify-end">
                                <IndianRupee className="w-3.5 h-3.5 mr-1" />
                                {seeker?.bidAmount?.toLocaleString("en-IN")}
                            </p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 px-2 italic">
                            Market Range: ₹{job.minBudget?.toLocaleString()} - {job.maxBudget?.toLocaleString()}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                      {job.testResult && (
                        <button
                          onClick={() => { setSelectedJob(job); setShowReviewModal(true); }}
                          className="px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 group/btn"
                        >
                          <FiTrendingUp className="w-4 h-4" /> Review Answers
                        </button>
                      )}
                      
                      <Link
                        to={seeker?.status === "Pending" ? `/seeker/project/${job._id}/apply-form` : `/seeker/project/${job._id}`}
                        className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-slate-300 hover:text-slate-900 transition-all flex items-center gap-2 group/btn"
                      >
                        {seeker?.status === "Pending" ? "Update Proposal" : "Project Details"} <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </Link>
                      {seeker?.status === "Accepted" && (
                        <Link
                          to={`/${role.toLowerCase()}/project/${job._id}/tracking`}
                          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2 animate-pulse hover:animate-none"
                        >
                          <Zap className="w-3.5 h-3.5" /> Track Progress
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {!loading && appliedJobs.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-20 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Briefcase className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">No Active Stakes</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
              Your application hub is waiting for its first entry. Explore global opportunities and make your mark.
            </p>
            <Link
              to="/seeker/findProjects"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
            >
              Browse Projects <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedJob?.testResult && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
            <div className="w-full max-w-5xl my-auto">
                <ReviewTest 
                    testId={selectedJob.testResult.testId._id || selectedJob.testResult.testId}
                    result={selectedJob.testResult}
                    onBack={() => { setShowReviewModal(false); setSelectedJob(null); }}
                />
            </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AppliedForm;
