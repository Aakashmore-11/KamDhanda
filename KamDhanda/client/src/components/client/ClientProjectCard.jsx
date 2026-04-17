import React from "react";
import { Button } from "../common/Index";
import { NavLink } from "react-router-dom";

const ClientProjectCard = ({ project }) => {
  const {
    title,
    description,
    budgetType,
    minBudget,
    maxBudget,
    skills,
    category,
    proposals,
    status,
    assignedFreelancerId,
  } = project;

  // Set of random color for profile circle
  const colors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-yellow-400",
    "bg-lime-500",
    "bg-green-400",
    "bg-emerald-400",
    "bg-teal-400",
    "bg-cyan-400",
    "bg-sky-400",
    "bg-blue-400",
    "bg-indigo-400",
    "bg-violet-400",
    "bg-purple-400",
    "bg-fuchsia-400",
    "bg-pink-400",
    "bg-rose-400",
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="border border-gray-200 rounded-lg p-2 sm:p-4   shadow-sm hover:shadow-md transition-shadow duration-300 select-none max-w-md w-full ">
      <div className="flex gap-3 flex-col  h-full ">
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between  items-start">
            <div className="flex gap-2">
              <div
                className={`w-8 h-8 ${randomColor} mt-1 rounded-full flex items-center justify-center text-white text-lg font-semibold line-clamp-1 `}
              >
                {project.title?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 pr-4">
                  {title}
                </h3>
                <span className="inline-block  px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                  {category}
                </span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full 
              ${
                status === "Open"
                  ? "bg-green-100 text-green-800"
                  : status === "Assigned"
                  ? "bg-indigo-100 text-indigo-800"
                  : status === "In Progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "Completed"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {description}
          </p>

          <div className="mt-3 space-y-1">
            <p className=" text-gray-600 text-sm  ">Type : {budgetType}</p>

            {/* Stipend and Skills */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {budgetType === "Fixed"
                  ? `₹${minBudget.toLocaleString(
                      "en-IN"
                    )} - ₹${maxBudget.toLocaleString("en-IN")} `
                  : `₹${minBudget.toLocaleString(
                      "en-IN"
                    )} - ₹${maxBudget.toLocaleString("en-IN")}/hr`}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
            {assignedFreelancerId ? (
              <span className="text-xs text-gray-500">Assigned</span>
            ) : (
              <span className="text-xs text-gray-500">Available</span>
            )}

            <NavLink to={`/client/project/${project._id}`}>
              <Button className="bg-primary/85 hover:bg-primary px-3 py-1 text-sm text-primary-text rounded">
                View Detail
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectCard;
