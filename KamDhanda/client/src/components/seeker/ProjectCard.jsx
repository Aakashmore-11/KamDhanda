import React from "react";
import { NavLink } from "react-router-dom";

const ProjectCard = ({ project }) => {
  if (!project) return null;

  const {
    assignedFreelancerId,
    budgetType,
    category,
    client_id,
    createdAt,
    description,
    maxBudget,
    minBudget,
    proposals,
    skills,
    status,
    title,
    _id,
  } = project;

  return (
    <>
      <NavLink
        to={`/seeker/project/${_id}`}
        className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col"
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {category ? category : "General"}
            </span>
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm
              ${status === "Open"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : status === "In Progress"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : status === "Completed"
                      ? "bg-purple-50 text-purple-700 border-purple-100"
                      : "bg-slate-50 text-slate-600 border-slate-100"
                }`}
            >
              {status || "Unknown"}
            </span>
          </div>

          {/* Job Title */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 mb-2">
              {title || "Untitled Project"}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 text-sm font-medium">
                {client_id?.fullName || "Verified Client"} • Remote
              </p>
              {project.matchScore !== undefined && (
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  {project.matchScore}% Match
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
            {description || "No description provided for this project."}
          </p>

          {/* Footer Info */}
          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Budget</span>
              <span className="text-sm font-bold text-slate-900">
                {budgetType === "Fixed"
                  ? `₹${(minBudget || 0).toLocaleString("en-IN")} - ₹${(maxBudget || 0).toLocaleString("en-IN")}`
                  : `₹${(minBudget || 0).toLocaleString("en-IN")} - ₹${(maxBudget || 0).toLocaleString("en-IN")}/hr`}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</span>
              <span className="text-[11px] font-bold text-indigo-600">
                {assignedFreelancerId ? "Assigned" : "Available"}
              </span>
            </div>
          </div>
        </div>
      </NavLink>
    </>
  );
};

export default ProjectCard;
