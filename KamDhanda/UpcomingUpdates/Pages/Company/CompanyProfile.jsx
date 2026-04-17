import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LogoutButton from "../../components/common/Logout";

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/company/getCompany`,
          { withCredentials: true }
        );
        console.log(res);
        setCompany(res.data);
      } catch (err) {
        console.error("Failed to load company profile", err);
      }
    };

    fetchCompanyProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          <img
            src={company?.companyLogo}
            alt={`${company?.companyName} logo`}
            className="w-32 h-32 object-contain rounded-full border-2 border-gray-200"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {company?.companyName}
          </h1>
          {company?.companyWebsiteUrl && (
            <a
              href={company?.companyWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-block mt-1"
            >
              {company?.companyWebsiteUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {company?.industry}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {company?.location}
            </span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">About Us</h2>
        <p className="text-gray-600 whitespace-pre-line">
          {company?.companyDescription}
        </p>
      </div>

      {/* Departments Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Departments
        </h2>
        <div className="flex flex-wrap gap-2">
          {company?.departments.map((dept, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {dept}
            </span>
          ))}
        </div>
      </div>

      {/* Recruiters Section */}
      {company?.recruiters && company?.recruiters.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Our Recruiters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {company?.recruiters.map((recruiter) => (
              <Link
                key={recruiter?._id}
                to={`/profile/${recruiter._id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <img
                  src={recruiter?.profilePicture || "/default-avatar.jpg"}
                  alt={recruiter?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-800">
                    {recruiter?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {recruiter?.position || "Recruiter"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Meta Information */}
      <div className="text-sm text-gray-500 border-t pt-4">
        <p>
          Company registered on:{" "}
          {new Date(company?.createdAt).toLocaleDateString()}
        </p>
        {company?.updatedAt && (
          <p>
            Last updated: {new Date(company?.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <LogoutButton />
    </div>
  );
  // return "Hello";
};

export default CompanyProfile;
