import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiSearch,
  HiOutlineMail,
  HiOutlinePhone,
  HiBriefcase,
  HiUserCircle,
} from "react-icons/hi";

const AllRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample data - replace with your API call
  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        // Replace with your actual API call
        // const response = await axios.get('/api/recruiters');
        // setRecruiters(response.data);

        // Mock data for demonstration
        setTimeout(() => {
          setRecruiters([
            {
              id: 1,
              name: "Sarah Johnson",
              email: "sarah@techcorp.com",
              phone: "+1 (555) 123-4567",
              position: "Senior Talent Acquisition",
              company: "TechCorp Inc.",
              profilePic: "",
              hiringFor: ["Frontend Developer", "UX Designer"],
            },
            {
              id: 2,
              name: "Michael Chen",
              email: "michael@innovate.com",
              phone: "+1 (555) 987-6543",
              position: "Recruitment Manager",
              company: "Innovate Solutions",
              profilePic: "",
              hiringFor: ["Backend Engineer", "Data Scientist"],
            },
            {
              id: 3,
              name: "Emma Rodriguez",
              email: "emma@digital.com",
              phone: "+1 (555) 456-7890",
              position: "Technical Recruiter",
              company: "Digital Ventures",
              profilePic: "",
              hiringFor: ["Full Stack Developer", "DevOps Engineer"],
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load recruiters");
        setLoading(false);
        console.error(err);
      }
    };

    fetchRecruiters();
  }, []);

  const filteredRecruiters = recruiters.filter(
    (recruiter) =>
      recruiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recruiter.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recruiter.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          All Recruiters
        </h1>
        <p className="text-gray-600">
          Browse and connect with professional recruiters
        </p>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, company or position..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredRecruiters.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No recruiters found matching your search
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecruiters.map((recruiter) => (
            <div
              key={recruiter.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {recruiter.profilePic ? (
                    <img
                      src={recruiter.profilePic}
                      alt={recruiter.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <HiUserCircle className="h-10 w-10 text-indigo-500" />
                    </div>
                  )}
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {recruiter.name}
                    </h2>
                    <p className="text-indigo-600">{recruiter.position}</p>
                    <p className="text-gray-500 text-sm">{recruiter.company}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <HiOutlineMail className="h-5 w-5 mr-2 text-indigo-500" />
                    <span>{recruiter.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <HiOutlinePhone className="h-5 w-5 mr-2 text-indigo-500" />
                    <span>{recruiter.phone}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <HiBriefcase className="h-5 w-5 mr-2 mt-1 text-indigo-500" />
                    <div>
                      <p className="font-medium mb-1">Hiring for:</p>
                      <div className="flex flex-wrap gap-2">
                        {recruiter.hiringFor.map((role, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Link
                    to={`/recruiters/${recruiter.id}`}
                    className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    View Profile
                  </Link>
                  <button className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition">
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllRecruiters;
