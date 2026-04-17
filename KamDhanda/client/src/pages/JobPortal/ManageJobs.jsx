import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import { Link } from 'react-router-dom';
import { FiUsers, FiEdit, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const serverAPI = serverObj.serverAPI;

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job listing? This action cannot be undone.")) return;

        try {
            const res = await axios.delete(`${serverAPI}/jobs/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success("Job deleted successfully");
                setJobs(prev => prev.filter(job => job._id !== jobId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete job");
        }
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get(`${serverAPI}/jobs/employer`, { withCredentials: true });
                setJobs(res.data.jobs);
            } catch (error) {
                console.error("Error fetching jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [serverAPI]);

    if (loading) return <div className="p-20 text-center text-gray-500">Loading Job Repository...</div>;

    return (
        <div className="w-full p-4 lg:p-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Manage Job Listings</h1>
                    <p className="text-gray-500">Review your active posts and candidate applications.</p>
                </div>
                <Link to="/client/post-job" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg transition-all">
                    + Post New Job
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => (
                    <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between shadow-sm hover:border-primary/20 transition-all">
                        <div className="flex-1 min-w-[300px]">
                            <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">{job.location} • {job.jobType} • Posted on {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-4 md:mt-0">
                            <div className="text-center px-6 border-x border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {job.status}
                                </span>
                            </div>
                            
                            <Link to={`/client/job-applications/${job._id}`} className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl font-bold hover:bg-primary/10 transition-colors">
                                <FiUsers size={18} /> View Applicants
                            </Link>
                            
                            <div className="flex gap-2 text-gray-400">
                                <button className="p-2 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-all"><FiEdit size={18} /></button>
                                <button 
                                    onClick={() => handleDelete(job._id)}
                                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {jobs.length === 0 && (
                    <div className="p-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                        <p className="text-gray-500 font-medium">You haven't posted any jobs yet.</p>
                        <Link to="/client/post-job" className="text-primary font-bold mt-2 block hover:underline">Get started now</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageJobs;
