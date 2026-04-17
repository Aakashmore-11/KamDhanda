import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Briefcase, LogOut, Edit, X, MapPin,
  Link, Loader2, Award, Globe, Calendar, Github,
  Linkedin, Twitter, Camera, CheckCircle, Sparkles,
  TrendingUp, Target, Clock, BookOpen, FileText, ChevronRight
} from "lucide-react";
import { FiEye, FiDownload } from "react-icons/fi";
import useAuth from "../../customHooks/useAuth";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import { handleSuccessMsg, handleErrorMsg } from "../../config/toast";
import { useDispatch } from "react-redux";
import { addUser } from "../../store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const SeekerProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const getDownloadUrl = (url) => {
    if (!url) return "#";
    let safeUrl = url.replace("http://", "https://");
    if (safeUrl.includes("res.cloudinary.com") && safeUrl.includes("/upload/")) {
      return safeUrl.replace("/upload/", "/upload/fl_attachment/");
    }
    return safeUrl;
  };

  const getSafeUrl = (url) => {
    if (!url) return "#";
    return url.replace("http://", "https://");
  };

  const getPreviewUrl = (url) => {
    if (!url) return "#";
    const safeUrl = url.replace("http://", "https://");
    // Secure preview proxy for Cloudinary PDFs
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(safeUrl)}`;
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [editData, setEditData] = useState({
    fullName: "",
    skills: "",
    location: "",
    experience: "",
    portfolioLink: "",
    bio: "",
    github: "",
    linkedin: "",
    twitter: "",
    availability: "",
    preferredRole: "",
    expectedSalary: "",
  });

  React.useEffect(() => {
    if (showEditModal && user) {
      setEditData({
        fullName: user.fullName || "",
        skills: user.skills ? user.skills.join(", ") : "",
        location: user.location || "",
        experience: user.experience || "",
        portfolioLink: user.portfolioLink || "",
        bio: user.bio || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
        availability: user.availability || "",
        preferredRole: user.preferredRole || "",
        expectedSalary: user.expectedSalary || "",
      });
    }
  }, [showEditModal, user]);

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

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    try {
      const formattedSkills = editData.skills.split(",").map(s => s.trim()).filter(s => s !== "");
      const res = await axios.patch(
        `${serverObj.serverAPI}/user/update-profile`,
        { ...editData, skills: formattedSkills },
        { withCredentials: true }
      );
      handleSuccessMsg(res.data.message);
      setShowEditModal(false);

      if (res.data?.user) {
        dispatch(addUser({ user: res.data.user, role: user.role }));
      }
    } catch (error) {
      console.error("Update Error:", error);
      handleErrorMsg(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      handleErrorMsg("Please select a PDF file for your resume");
      return;
    }

    const formData = new FormData();
    formData.append('resumePdf', file);

    setIsUpdating(true);
    try {
      const res = await axios.patch(
        `${serverObj.serverAPI}/user/update-resume`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      handleSuccessMsg("Resume updated successfully!");

      if (res.data?.user) {
        dispatch(addUser({ user: res.data.user, role: user.role }));
      }
    } catch (error) {
      console.error("Resume Upload Error:", error);
      handleErrorMsg(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] select-none w-full bg-slate-50 relative overflow-hidden pb-12">
      {/* Background Orbs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
        <div className="w-[600px] h-[600px] bg-indigo-200 rounded-full blur-[120px] absolute -top-40 right-10"></div>
        <div className="w-[400px] h-[400px] bg-sky-200 rounded-full blur-[100px] absolute top-40 -left-20"></div>
      </div>

      <div className="relative z-10 w-full py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

          {/* Profile Header/Cover */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
            {/* Cover Strip */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"></div>

            <div className="px-6 sm:px-10 pb-10">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 relative">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="h-28 w-28 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100">
                    <div className="h-full w-full rounded-xl bg-slate-100 overflow-hidden relative">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          className="h-full w-full object-cover"
                          alt="Profile"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-3xl font-black text-indigo-500">
                          {getInitials(user.fullName)}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-xl cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {isUpdating ? <Loader2 size={24} className="animate-spin text-white" /> : <Camera size={24} className="text-white" />}
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                {/* Name & Role */}
                <div className="flex-1 w-full flex flex-col sm:flex-row justify-between sm:items-end gap-4 mt-2 sm:mt-0">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                      {user.fullName}
                      {user.verified && (
                        <CheckCircle className="text-sky-500 fill-sky-100" size={24} />
                      )}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-indigo-100">
                        <Briefcase size={14} />
                        {user.role}
                      </span>
                      {user.experience && (
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200">
                          {user.experience}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-start sm:justify-end">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all font-bold text-sm active:scale-95"
                    >
                      <Edit size={16} /> Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-rose-500 rounded-xl hover:bg-rose-50 transition-all font-bold text-sm border border-slate-200 hover:border-rose-200 active:scale-95"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Profile Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-500">Views</span>
                    <span className="text-lg font-black text-indigo-600">--</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-500">Applications</span>
                    <span className="text-lg font-black text-emerald-600">--</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-500">Strength</span>
                    <span className="text-lg font-black text-sky-600">100%</span>
                  </div>
                </div>
              </div>

            </motion.div>

            {/* Right Main Area */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-slate-200 p-2 gap-2 bg-slate-50 overflow-x-auto scroller-hide">
                  {["about", "skills", "social", "resume"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-bold capitalize rounded-xl transition-all whitespace-nowrap outline-none ${activeTab === tab
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6 md:p-8 min-h-[400px]">
                  <AnimatePresence mode="wait">

                    {/* ABOUT */}
                    {activeTab === "about" && (
                      <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600 shrink-0"><Mail size={18} /></div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                              <p className="text-sm font-bold text-slate-800 truncate" title={user.email}>{user.email}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 shrink-0"><MapPin size={18} /></div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                              <p className="text-sm font-bold text-slate-800">{user.location || "Not specified"}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <div className="bg-sky-100 p-2 rounded-xl text-sky-600 shrink-0"><Award size={18} /></div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                              <p className="text-sm font-bold text-slate-800">{user.experience || "Not specified"}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <div className="bg-rose-100 p-2 rounded-xl text-rose-600 shrink-0"><Globe size={18} /></div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portfolio</p>
                              {user.portfolioLink ? (
                                <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:underline">View Portfolio</a>
                              ) : (
                                <p className="text-sm font-bold text-slate-500">Not provided</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Bio</h3>
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed">
                            {user.bio || "No bio added yet. Click edit to add a bio and tell others about yourself!"}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SKILLS */}
                    {activeTab === "skills" && (
                      <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {user.skills && user.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill, index) => (
                              <span key={index} className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold uppercase tracking-wider rounded-xl">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                              <BookOpen size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">No skills added</h4>
                            <p className="text-slate-500 mt-2">Update your profile to add your expertise.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* SOCIAL */}
                    {activeTab === "social" && (
                      <motion.div key="social" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.github && (
                          <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-900 hover:text-white transition-colors group">
                            <div className="flex items-center gap-3">
                              <Github size={20} />
                              <span className="font-bold">GitHub</span>
                            </div>
                            <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                          </a>
                        )}
                        {user.linkedin && (
                          <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white transition-colors group">
                            <div className="flex items-center gap-3">
                              <Linkedin size={20} />
                              <span className="font-bold">LinkedIn</span>
                            </div>
                            <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                          </a>
                        )}
                        {user.twitter && (
                          <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-sky-500 hover:border-sky-500 hover:text-white transition-colors group">
                            <div className="flex items-center gap-3">
                              <Twitter size={20} />
                              <span className="font-bold">Twitter</span>
                            </div>
                            <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                          </a>
                        )}
                        {!user.github && !user.linkedin && !user.twitter && (
                          <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                              <Globe size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">No social links</h4>
                            <p className="text-slate-500 mt-2">Add links to your social profiles to improve your visibility.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* RESUME */}
                    {activeTab === "resume" && (
                      <motion.div key="resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                        <div className="p-6 md:p-8 bg-indigo-50 border border-indigo-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                              <FileText size={32} />
                            </div>
                            <div>
                              <h3 className="text-xl font-extrabold text-slate-900">Master Resume</h3>
                              <p className="text-sm font-medium text-slate-600 mt-1 max-w-sm">This file is attached to your quick-applies. Ensure it's always up to date.</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {user.resume && (
                              <div className="flex gap-2">
                                <a href={getPreviewUrl(user.resume)} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-2 px-4 py-3 bg-white text-indigo-600 rounded-xl font-bold border border-indigo-100 hover:bg-slate-50 transition-all text-sm shadow-sm">
                                  <FiEye size={16} /> View
                                </a>
                                <a href={getDownloadUrl(user.resume)} className="flex justify-center items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm shadow-sm">
                                  <FiDownload size={16} /> Download
                                </a>
                              </div>
                            )}
                            <label className="flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all cursor-pointer font-sm whitespace-nowrap shadow-md shadow-indigo-200 active:scale-95">
                              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                              {user.resume ? 'Update' : 'Upload'}
                              <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={isUpdating} />
                            </label>
                          </div>
                        </div>

                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit size={20} className="text-indigo-600" /> Edit Profile
                </h2>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-xl border border-slate-200 shadow-sm transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="p-6 md:p-8 space-y-5 max-h-[65vh] overflow-y-auto scroller-hide bg-white">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location</label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Bio</label>
                    <textarea
                      rows="3"
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Skills (comma separated)</label>
                    <input
                      type="text"
                      value={editData.skills}
                      onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="React, Node.js, Design"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Experience Level</label>
                      <select
                        value={editData.experience}
                        onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Junior</option>
                        <option value="Intermediate">Mid-Level</option>
                        <option value="Expert">Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Expected Salary</label>
                      <input
                        type="text"
                        value={editData.expectedSalary}
                        onChange={(e) => setEditData({ ...editData, expectedSalary: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        placeholder="₹10LPA"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Web Connectivity</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Portfolio URL</label>
                        <input type="url" value={editData.portfolioLink} onChange={(e) => setEditData({ ...editData, portfolioLink: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500" placeholder="https://" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">GitHub</label>
                          <input type="url" value={editData.github} onChange={(e) => setEditData({ ...editData, github: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500" placeholder="https://" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">LinkedIn</label>
                          <input type="url" value={editData.linkedin} onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500" placeholder="https://" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isUpdating} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70">
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SeekerProfile;