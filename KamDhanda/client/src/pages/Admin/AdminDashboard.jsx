import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverObj } from '../../config/serverConfig';
import {
    Users,
    Briefcase,
    Activity,
    FileText,
    TrendingUp,
    AlertCircle,
    UserCheck,
    UserPlus,
    Clock,
    CheckCircle,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Eye,
    MessageSquare,
    Star,
    IndianRupee,
    Zap,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => {
    const isPositive = trend === 'up';

    return (
        <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
            }}
            className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full flex flex-col"
        >
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
                        {trendValue && (
                            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg mb-1 ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {trendValue}
                            </span>
                        )}
                    </div>
                </div>

                <div className={`p-4 rounded-2xl ${color} bg-opacity-10 shrink-0 relative group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className={`text-${color.split(' ')[0].split('-')[1]}-600`} />
                </div>
            </div>

            <div className="mt-auto pt-6 w-full flex justify-between items-end relative z-10">
                {subtitle && (
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Clock size={12} />
                        {subtitle}
                    </p>
                )}
            </div>
            
            <div className={`absolute bottom-0 left-0 w-full h-1 ${color} opacity-20`} />
        </motion.div>
    );
};

const ActivityItem = ({ icon: Icon, title, time, status, colorClass }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 shrink-0`}>
            <Icon size={18} className={`text-${colorClass.split('-')[1]}-600`} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1">{title}</h4>
            <p className="text-xs font-bold text-slate-400 mt-1">{time}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border shrink-0 ${
            status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
            'bg-sky-50 text-sky-600 border-sky-100'
        }`}>
            {status}
        </span>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClients: 0,
        totalSeekers: 0,
        totalProjects: 0,
        activeProjects: 0,
        totalProposals: 0,
        newUsersToday: 0,
        completedProjects: 0,
        pendingReviews: 0,
        totalJobs: 0,
        totalJobApplications: 0
    });

    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${serverObj.serverAPI}/admin/stats?range=${timeRange}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    setStats(res.data.stats);
                    if (res.data.stats.chartData) {
                        setChartData(res.data.stats.chartData);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [timeRange]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6 mt-10">
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-rose-900 text-lg">Failed to Load</h3>
                        <p className="text-rose-600 font-bold text-sm mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const recentActivities = [
        { icon: UserPlus, title: 'New user registered', time: '5 minutes ago', status: 'completed', colorClass: 'bg-emerald-500' },
        { icon: FileText, title: 'Project "Website Redesign" created', time: '1 hour ago', status: 'pending', colorClass: 'bg-indigo-500' },
        { icon: MessageSquare, title: 'New proposal submitted', time: '2 hours ago', status: 'active', colorClass: 'bg-sky-500' },
        { icon: CheckCircle, title: 'Project completed', time: '5 hours ago', status: 'completed', colorClass: 'bg-emerald-500' },
    ];

    return (
        <div className="min-h-screen select-none w-full bg-slate-50 relative overflow-hidden pb-12">
            {/* Background Orbs */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-multiply flex justify-center">
                <div className="w-[600px] h-[600px] bg-indigo-200 rounded-full blur-[120px] absolute -top-40 right-10"></div>
                <div className="w-[400px] h-[400px] bg-purple-200 rounded-full blur-[100px] absolute top-40 -left-20"></div>
            </div>

            <div className="relative z-10 w-full py-8 pt-6">
                
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg shrink-0">
                                <Shield size={16} className="fill-indigo-600 text-indigo-100"/>
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Admin Area</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
                    </div>

                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-fit self-start md:self-center overflow-x-auto scroller-hide">
                        {['day', 'week', 'month', 'overall'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${timeRange === range
                                    ? 'bg-white text-indigo-600 shadow-md border-slate-100'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <StatCard 
                            title={timeRange === 'overall' ? "Total Users" : `New Users (${timeRange})`} 
                            value={timeRange === 'overall' ? stats.totalUsers : (stats.rangeStats?.newUsers || 0)} 
                            icon={Users} 
                            color="bg-indigo-500" 
                            subtitle={timeRange === 'overall' ? `${stats.newUsersToday} new today` : `${stats.totalUsers} total users`} 
                        />
                        <StatCard 
                            title="Total Clients" 
                            value={stats.totalClients} 
                            icon={Briefcase} 
                            color="bg-sky-500" 
                            subtitle="Employer accounts"
                        />
                        <StatCard 
                            title="Job Seekers" 
                            value={stats.totalSeekers} 
                            icon={UserCheck} 
                            color="bg-emerald-500" 
                            subtitle="Professional profiles"
                        />
                        <StatCard 
                            title={timeRange === 'overall' ? "Total Projects" : `New Postings (${timeRange})`} 
                            value={timeRange === 'overall' ? stats.totalProjects : (stats.rangeStats?.newProjects || 0)} 
                            icon={FileText} 
                            color="bg-purple-500" 
                            subtitle={timeRange === 'overall' ? "Overall high-load" : `${stats.totalProjects} total projects`}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Chart Area */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-indigo-600" /> Platform Activity
                                </h2>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Users
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Projects
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white rounded-2xl flex items-center justify-center pt-6 pr-6 border border-slate-100 min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{
                                            top: 10,
                                            right: 30,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dx={-10} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}
                                            itemStyle={{ fontWeight: 800 }}
                                        />
                                        <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                        <Area type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProjects)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Activity size={20} className="text-purple-600" />
                                    Live Log
                                </h2>
                                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                </span>
                            </div>
                            <div className="p-4 flex-1">
                                <div className="space-y-2">
                                    {recentActivities.map((activity, index) => (
                                        <ActivityItem key={index} {...activity} />
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50">
                                <button className="w-full py-3.5 bg-white border border-slate-200 text-indigo-600 font-bold rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-sm">
                                    View Full Logs
                                </button>
                            </div>
                        </motion.div>

                    </div>

                    {/* Quick Stats Banner */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Avg. Response Time', value: '2.4h', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Active Sessions', value: '1,241', icon: Activity, color: 'text-sky-600', bg: 'bg-sky-50' },
                            { label: 'Platform Revenue', value: '₹12.4k', icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50' },
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                                    <p className="font-black text-slate-800 text-xl leading-none mt-1 truncate">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;