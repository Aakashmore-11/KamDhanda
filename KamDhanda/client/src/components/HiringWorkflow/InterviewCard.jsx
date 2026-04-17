import React from 'react';
import { FiCalendar, FiClock, FiExternalLink, FiVideo } from 'react-icons/fi';

const InterviewCard = ({ interview, role }) => {
    const isClient = role === 'Client';
    const otherUser = isClient ? interview.seekerId : interview.clientId;

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col md:flex-row items-center gap-8 group hover:border-indigo-200 transition-all duration-500">
            {/* User Info */}
            <div className="shrink-0 flex flex-col items-center">
                <img
                    src={otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.fullName || 'User')}&background=random`}
                    className="w-20 h-20 rounded-3xl object-cover ring-4 ring-gray-50 group-hover:scale-105 transition-transform"
                    alt={otherUser?.fullName || 'User'}
                />
                <h4 className="mt-3 text-sm font-black text-gray-800">{otherUser?.fullName || 'Unknown User'}</h4>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{isClient ? 'Applicant' : 'Hiring Manager'}</p>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4 text-center md:text-left w-full">
                <div>
                   <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest leading-none mb-1">Upcoming Interview</p>
                   <h3 className="text-xl font-black text-gray-800 tracking-tight">{interview.jobId?.title || 'Job Interview'}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <FiCalendar className="text-indigo-400" />
                        {new Date(interview.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <FiClock className="text-indigo-400" />
                        {interview.time} ({interview.duration}m)
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-xs font-medium">
                   "{interview.notes || 'No notes provided.'}"
                </div>
            </div>

            {/* CTA */}
            <div className="shrink-0 w-full md:w-auto">
                <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 group"
                >
                    <FiVideo className="w-5 h-5 group-hover:animate-pulse" /> JOIN MEETING <FiExternalLink />
                </a>
            </div>
        </div>
    );
};

export default InterviewCard;
