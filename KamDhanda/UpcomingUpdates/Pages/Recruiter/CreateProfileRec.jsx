import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Phone,
  Link,
  User,
  ChevronDown,
  ImageIcon,
  Upload,
} from "lucide-react";
import { Input, Button, Select } from "../../components/common/Index";
import { serverObj } from "../../config/serverConfig";
import { handleSuccessMsg } from "../../config/toast";

const CompleteRecruiterProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();
  const [companies, setCompanies] = useState([]);
  const [companyNames, setCompanyNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const profilePicPreview = watch("recruiterProfilePic");

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(
        `${serverObj.serverAPI}/company/getCompanies`,
        { withCredentials: true }
      );
      setCompanies(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const cn = companies.map((company, i) => company.companyName);
    setCompanyNames(cn);
  }, [companies]);

  const recruiterPositions = [
    "HR Recruiter",
    "Talent Acquisition Specialist",
    "Technical Recruiter",
    "IT Recruiter",
    "Non-IT Recruiter",
    "Campus Recruiter",
    "Recruitment Coordinator",
    "Sourcing Specialist",
    "Executive Recruiter",
    "Staffing Specialist",
    "Recruitment Consultant",
    "Hiring Manager",
    "Lead Recruiter",
    "Recruitment Analyst",
    "Senior Recruiter",
    "Junior Recruiter",
    "Global Recruiter",
    "Contract Recruiter",
    "Freelance Recruiter",
    "Full-Cycle Recruiter",
  ];

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const matchedCompany = companies.find(
        (company) => company.companyName === data.recruiterCompanyName
      );
      const formData = new FormData();
      formData.append("recruiterCompanyId", matchedCompany._id);
      formData.append("recruiterPosition", data.recruiterPostion);
      formData.append("phoneNo", data.phoneNo);
      formData.append("location", data.location);

      if (data.recruiterProfilePic.length > 0)
        formData.append("recruiterProfilePic", data.recruiterProfilePic?.[0]);
      formData.append("recruiterBio", data.recruiterBio);

      const res = await axios.patch(
        `${serverObj.serverAPI}/user/completeRecruiter-profile`,
        formData,
        { withCredentials: true }
      );

      const recruiter = res?.data?.recruiter;
      handleSuccessMsg(res?.data?.message);

      const result = await axios.patch(
        `${serverObj.serverAPI}/company/add-recruiter`,
        { companyId: matchedCompany._id, recruiterId: recruiter._id },
        { withCredentials: true }
      );
      console.log(result);
      //   navigate("/recruiter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
      reset();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Complete Your Recruiter Profile
      </h2>
      <p className="text-gray-600 mb-6">
        Help candidates get to know you better
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Company Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <Briefcase className="text-indigo-600" size={20} />
                Company Information
              </h3>

              <div className="space-y-4">
                <Select
                  label="Company *"
                  name="recruiterCompanyId"
                  defaultValue="Select Company"
                  options={companyNames}
                  {...register("recruiterCompanyName", {
                    required: "Please select your company",
                  })}
                  error={errors.recruiterCompanyName?.message}
                />

                <Select
                  label="Your Position *"
                  name="recruiterPostion"
                  defaultValue="Select Position"
                  placeholder="e.g., Talent Acquisition Specialist"
                  icon={Briefcase}
                  options={recruiterPositions}
                  {...register("recruiterPostion", {
                    required: "Please select your position",
                  })}
                  error={errors.recruiterPostion?.message}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <Phone className="text-indigo-600" size={20} />
                Contact Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Phone Number *"
                  name="phoneNo"
                  type="text"
                  placeholder="9535*******"
                  icon={Phone}
                  maxLength={10}
                  className="appearance-none tracking-wider"
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(/\D/g, ""))
                  }
                  {...register("phoneNo", {
                    required: "Phone number is required",
                    minLength: {
                      value: 10,
                      message: "Phone number must be 10 digits",
                    },
                    maxLength: {
                      value: 10,
                      message: "Phone number must be 10 digits",
                    },
                  })}
                  error={errors.phoneNo?.message}
                />

                <Input
                  label="Location *"
                  name="location"
                  placeholder="City, Country"
                  icon={MapPin}
                  {...register("location", {
                    required: "Location is required",
                  })}
                  error={errors.location?.message}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Professional Details */}
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <User className="text-indigo-600" size={20} />
                Professional Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recruiter ProfilePic
                </label>
                <div className="flex items-center space-x-4">
                  <div className="shrink-0 rounded-full overflow-hidden">
                    {profilePicPreview?.[0] ? (
                      <img
                        className="h-20 w-20 rounded-full object-cover object-center border-2 border-gray-200"
                        alt="Your Profile"
                        src={URL.createObjectURL(profilePicPreview[0])}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="block">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Button
                        type="button"
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 flex gap-2 items-center relative bg-gray-50 "
                      >
                        <input
                          type="file"
                          className=" opacity-0 absolute inset-0 "
                          accept="image/*"
                          {...register("recruiterProfilePic")}
                        />
                        <Upload size={16} />
                        Upload
                      </Button>
                      <span className="text-xs text-gray-500">
                        PNG, JPG up to 2MB
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                <div>
                  <label
                    htmlFor="recruiterBio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Recruiter Bio *
                  </label>
                  <textarea
                    id="recruiterBio"
                    {...register("recruiterBio", {
                      required: "Bio is required",
                    })}
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    placeholder="Tell candidates about your experience, specialties, and approach..."
                  ></textarea>
                  {errors.recruiterBio && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.recruiterBio.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-end gap-4  border-t border-gray-200 w-full">
          <Button
            type="submit"
            disabled={loading}
            className={`${
              loading
                ? "bg-primary/60 cursor-not-allowed"
                : "bg-primary hover:bg-primary-hover"
            }  p-2  text-white`}
          >
            {loading ? "Creating Profile..." : "Complete Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompleteRecruiterProfile;
