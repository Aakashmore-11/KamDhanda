import React, { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Phone,
  Linkedin,
  User,
  Mail,
  Globe,
} from "lucide-react";
import axios from "axios";
import { serverObj } from "../../../client/src/config/serverConfig";

const RecruiterProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${serverObj.serverAPI}/user/getCurrentUser`,
          { withCredentials: true }
        );
        setProfile(res.data.user);
      } catch (err) {
        setError("Failed to load profile data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="w-full text-center py-12 text-red-500 text-lg">
        {error}
      </div>
    );
  if (!profile)
    return (
      <div className="w-full text-center py-12 text-gray-500 text-lg">
        No profile data found
      </div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-sm select-none pointer-events-none">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-indigo-50 shadow-md overflow-hidden">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User size={48} />
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800">
            {profile.fullName}
          </h1>
          {profile.recruiterPosition && (
            <p className="text-xl text-indigo-600 font-medium mt-2">
              {profile.recruiterPosition}
            </p>
          )}
          {profile.recruiterCompanyId?.companyName && (
            <p className="text-lg text-gray-600 mt-1">
              {profile.recruiterCompanyId.companyName}
            </p>
          )}

          {/* Contact Quick Info */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            {profile.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={18} className="text-indigo-500" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.phoneNo && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={18} className="text-indigo-500" />
                <span>{profile.phoneNo}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-indigo-500" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Company Details */}
          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3 mb-5">
              <Briefcase className="text-indigo-600" size={22} />
              <h2 className="text-xl font-semibold text-gray-800">
                Company Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Company Name
                </h3>
                <p className="text-lg font-medium text-gray-800">
                  {profile.recruiterCompanyId?.companyName || "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Your Position
                </h3>
                <p className="text-lg font-medium text-gray-800">
                  {profile.recruiterPosition || "Not specified"}
                </p>
              </div>

              {profile.recruiterCompanyId?.website && (
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-gray-400" />
                  <a
                    href={profile.recruiterCompanyId.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    Company Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3 mb-5">
              <Phone className="text-indigo-600" size={22} />
              <h2 className="text-xl font-semibold text-gray-800">
                Contact Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Email
                </h3>
                <p className="text-gray-800">{profile.email}</p>
              </div>

              {profile.phoneNo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </h3>
                  <p className="text-gray-800">{profile.phoneNo}</p>
                </div>
              )}

              {profile.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Location
                  </h3>
                  <p className="text-gray-800">{profile.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Professional Summary */}
          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 h-full">
            <div className="flex items-center gap-3 mb-5">
              <User className="text-indigo-600" size={22} />
              <h2 className="text-xl font-semibold text-gray-800">
                Professional Summary
              </h2>
            </div>

            <div className="prose max-w-none">
              {profile.recruiterBio ? (
                profile.recruiterBio.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-4 text-gray-700">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">No bio provided</p>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                CONNECT WITH ME
              </h3>
              <div className="flex gap-4">
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <Linkedin size={20} />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
