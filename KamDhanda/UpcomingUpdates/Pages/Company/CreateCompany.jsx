import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  PenLine,
  Upload,
  Users,
  DollarSign,
  Code,
  Paintbrush,
  Megaphone,
  Handshake,
  HeartPulse,
  Settings,
  HelpCircle,
  Check,
  ImageIcon,
  ChevronDown,
  Landmark,
} from "lucide-react";
import { Input, Button, Select } from "../../../client/src/components/common/Index";
import cities from "indian-cities-json";
import axios from "axios";
import { serverObj } from "../../../client/src/config/serverConfig";
import { handleSuccessMsg, handleErrorMsg } from "../../../client/src/config/toast";

const CreateCompany = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm();
  const logoPreview = watch("companyLogo");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const serverAPI = serverObj.serverAPI;

  const industryOptions = [
    "Information Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Media",
    "Consulting",
    "Government",
    "Other",
  ];

  const hiringOptions = [
    {
      value: "Development",
      icon: <Code className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      value: "Design",
      icon: <Paintbrush className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      value: "Marketing",
      icon: <Megaphone className="w-5 h-5" />,
      color: "bg-pink-100 text-pink-600",
    },
    {
      value: "Sales",
      icon: <Handshake className="w-5 h-5" />,
      color: "bg-green-100 text-green-600",
    },
    {
      value: "HR",
      icon: <Users className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      value: "Finance",
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      value: "Operations",
      icon: <Settings className="w-5 h-5" />,
      color: "bg-gray-100 text-gray-600",
    },
    {
      value: "Support",
      icon: <HeartPulse className="w-5 h-5" />,
      color: "bg-red-100 text-red-600",
    },
    {
      value: "Other",
      icon: <HelpCircle className="w-5 h-5" />,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const citiesOptions = cities.cities.slice(0, 100).map((city, i) => {
    return `${city.name}, ${city.state}`;
  });

  const toggleDepartment = (department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("companyName", data.companyName);
    if (data.companyLogo?.[0])
      formData.append("companyLogo", data.companyLogo[0]);
    formData.append("companyWebsiteUrl", data.companyWebsiteUrl);
    formData.append("industry", data.industry);
    formData.append("location", data.location);
    formData.append("companyDescription", data.companyDescription);
    formData.append("departments", JSON.stringify(selectedDepartments));

    axios
      .post(`${serverAPI}/company/createCompany`, formData, {
        withCredentials: true,
      })
      .then((res) => console.log(res.data.message))
      .catch((err) => handleErrorMsg(err));
  };

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Updated Header with Icon */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center mb-4">
            <Landmark className="h-10 w-10 text-indigo-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Create Company Profile
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete your company profile to attract the best talent
          </p>
        </div>

        <div className="shadow-xl rounded-2xl overflow-hidden">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 sm:px-8 py-8 sm:py-10"
            encType="multipart/form-data"
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Company Name */}
                <div>
                  <Input
                    label="Company Name *"
                    icon={Building2}
                    {...register("companyName", { required: true })}
                    placeholder="e.g. Tech Innovations Inc."
                    error={errors.companyName?.message}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">
                      Company name is required
                    </p>
                  )}
                </div>

                {/* Company Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0 rounded-full overflow-hidden">
                      {logoPreview?.[0] ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                          alt="Company logo"
                          src={URL.createObjectURL(logoPreview[0])}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="block">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 flex gap-2 items-center relative"
                        >
                          <input
                            type="file"
                            className="w-full h-full opacity-0 absolute top-0 left-0 cursor-pointer"
                            accept="image/*"
                            {...register("companyLogo")}
                            error={errors.companyLogo?.message}
                          />
                          <Upload size={16} />
                          Upload
                        </button>
                        <span className="text-xs text-gray-500">
                          PNG, JPG up to 2MB
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Website */}
                <Input
                  label="Website"
                  icon={Globe}
                  {...register("companyWebsiteUrl")}
                  placeholder="https://yourcompany.com"
                />

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <div className="relative">
                    <Select
                      defaultValue="Select Industry"
                      options={industryOptions}
                      {...register("industry", {
                        required: {
                          value: true,
                          message: "Industry is required!",
                        },
                      })}
                      className="w-full py-3 pl-3 pr-10 border border-gray-300 rounded-lg  appearance-none"
                    />
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.industry && (
                    <p className=" text-sm text-red-600">
                      {errors.industry.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Location */}
                <div className="relative">
                  <Select
                    label="Location"
                    defaultValue="Select location"
                    options={citiesOptions}
                    {...register("location", { required: true })}
                    className={"appearance-none"}
                  />
                  <ChevronDown className="absolute right-3 top-10.5 h-4 w-4 text-gray-400 pointer-events-none" />

                  {errors.location && (
                    <p className=" text-sm text-red-600">
                      Location is required!
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <PenLine className="w-4 h-4 mr-2 text-gray-500" />
                    Company Description *
                  </label>
                  <textarea
                    {...register("companyDescription", {
                      required: {
                        value: true,
                        message: "Company description is required!",
                      },
                      maxLength: {
                        value: 1000,
                        message: "Description is too long!",
                      },
                    })}
                    rows={8}
                    className="block resize-none w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="Tell us about your company's mission, culture, and values..."
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {watch("companyDescription")?.length || 0}/1000 characters
                    </span>
                    {errors.companyDescription && (
                      <p className=" text-sm text-red-600">
                        {errors.companyDescription.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hiring For Section */}
            <div className="max-w-6xl mx-auto mt-10 select-none">
              <label className="flex items-center font-medium text-gray-700 mb-4 flex-wrap">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-500 " />
                  What departments are you hiring for? *
                </div>
                {selectedDepartments.length == 0 && (
                  <p className="text-sm font-medium text-red-500 ml-1">
                    (Select atleast one department!)
                  </p>
                )}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {hiringOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => toggleDepartment(option.value)}
                    className={`px-2 py-4 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${
                      selectedDepartments.includes(option.value)
                        ? ` border-indigo-500 ${option.color.replace(
                            "bg-",
                            "bg-opacity-20"
                          )}`
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${option.color} flex items-center justify-center mb-2`}
                    >
                      {option.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {option.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-200 flex justify-end">
              <Button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
              >
                Save Company Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany;
