import React from "react";
import { useForm } from "react-hook-form";
import {
  Briefcase,
  X,
  Check,
  Tag,
  List,
  FileText,
  IndianRupee,
  Send,
} from "lucide-react";
import { Input, Select, Button } from "../../components/common/Index";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import { handleErrorMsg, handleSuccessMsg } from "../../config/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NewProject = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm();
  const serverAPI = serverObj.serverAPI;

  const budgetType = watch("budgetType");
  const skills = watch("skills") || [];
  const category = watch("category");
  const navigate = useNavigate();

  const budgetTypeOptions = ["Fixed", "Hourly"];

  const categoryOptions = [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "Content Writing",
    "Digital Marketing",
    "Virtual Assistant",
    "Data Analytics",
    "Customer Support",
    "Sales",
    "Other",
  ];

  const handleAddSkill = () => {
    const currentSkill = watch("currentSkill");
    if (currentSkill && !skills.includes(currentSkill)) {
      setValue("skills", [...skills, currentSkill]);
      setValue("currentSkill", "");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setValue(
      "skills",
      skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const onSubmit = (data) => {
    axios
      .post(`${serverAPI}/freelancerProject/create-project`, data, {
        withCredentials: true,
      })
      .then((res) => {
        handleSuccessMsg(res.data.message);
        navigate(`/client/project/${res.data.project._id}`);
      })
      .catch((err) => handleErrorMsg(err.message));
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen pb-12 select-none w-full bg-slate-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
        <div className="w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[100px] absolute -top-40 right-20"></div>
      </div>

      <div className="relative z-10 w-full py-8">
        
        {/* Header styling matching the new startup theme */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
            New Project
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Post an opportunity
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Attract the best freelance talent by filling in the details below.</p>
        </motion.div>

        <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Project Title & Description */}
          <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
               <FileText className="text-indigo-500" size={20} /> Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., Build a responsive e-commerce website"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                  {...register("title", { required: "Project title is required" })}
                />
                {errors.title && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Description</label>
                <textarea
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm resize-y"
                  placeholder="Describe your project in detail..."
                  {...register("description", {
                    required: "Description is required",
                    minLength: { value: 50, message: "Description should be at least 50 characters" },
                  })}
                />
                {errors.description && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.description.message}</p>}
              </div>
            </div>
          </motion.div>

          {/* Budget Section */}
          <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
               <IndianRupee className="text-emerald-500" size={20} /> Budget Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Budget Type</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                  {...register("budgetType", { required: true })}
                >
                    {budgetTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Min Budget (₹)</label>
                <input
                  type="text"
                  placeholder={budgetType === "Fixed" ? "Min amount" : "Min rate"}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                  {...register("minBudget", {
                    required: "Required",
                    validate: (value) => {
                      const num = parseInt(value.replace(/,/g, ""), 10);
                      return num > 0 || "Must be > 0";
                    },
                  })}
                  onInput={(e) => {
                    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                    e.target.value = raw ? Number(raw).toLocaleString("en-IN") : "";
                    setValue("minBudget", e.target.value, { shouldValidate: true });
                  }}
                />
                {errors.minBudget && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.minBudget.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Budget (₹)</label>
                <input
                  type="text"
                  placeholder={budgetType === "Fixed" ? "Max amount" : "Max rate"}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                  {...register("maxBudget", {
                    required: "Required",
                    validate: (value) => {
                      const min = parseInt((watch("minBudget") || "0").replace(/,/g, ""), 10);
                      const max = parseInt((value || "0").replace(/,/g, ""), 10);
                      if (isNaN(max) || max <= 0) return "Must be > 0";
                      if (max < min) return "Max > Min";
                      return true;
                    },
                  })}
                  onInput={(e) => {
                    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                    e.target.value = raw ? Number(raw).toLocaleString("en-IN") : "";
                    setValue("maxBudget", e.target.value, { shouldValidate: true });
                  }}
                />
                {errors.maxBudget && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.maxBudget.message}</p>}
              </div>
            </div>
          </motion.div>

          {/* Category & Skills Section */}
          <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
               <Briefcase className="text-sky-500" size={20} /> Expertise Required
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="">Select Category...</option>
                  {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.category && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.category.message}</p>}

                {category === "Other" && (
                  <div className="mt-4">
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      placeholder="Specify your category"
                      {...register("otherCategory", { required: category === "Other" ? "Required" : false })}
                    />
                    {errors.otherCategory && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.otherCategory.message}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                    placeholder="e.g., React, Photoshop"
                    {...register("currentSkill")}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-indigo-100 text-indigo-700 font-bold px-4 py-3 rounded-xl hover:bg-indigo-200 transition-colors whitespace-nowrap"
                  >
                    Add Skill
                  </button>
                </div>
                <input type="hidden" {...register("skills")} />
                
                {skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-indigo-400 hover:text-indigo-700">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Form Actions */}
          <motion.div variants={itemVariants} className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => reset()}
              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors w-full md:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 w-full md:w-auto"
            >
              <Send size={18} />
              Post Project
            </button>
          </motion.div>

        </motion.form>
      </div>
    </div>
  );
};

export default NewProject;
