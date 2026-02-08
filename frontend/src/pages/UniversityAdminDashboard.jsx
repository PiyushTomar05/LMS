import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Users, GraduationCap, DollarSign, BookOpen, ArrowRight, UserPlus, Settings, Calendar, Shield, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Announcements from '../components/Announcements';

const UniversityAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState({
        students: 0,
        professors: 0,
        courses: 0,
        revenue: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);

    // Refresh stats when location changes or user changes
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersRes = await api.get(`/auth/university/${user.universityId}`);
                const students = usersRes.data.filter(u => u.role === 'STUDENT');
                const professors = usersRes.data.filter(u => u.role === 'PROFESSOR');
                const coursesRes = await api.get(`/courses/university/${user.universityId}`);

                setStats({
                    students: students.length,
                    professors: professors.length,
                    courses: coursesRes.data.length,
                    revenue: students.length * 12000
                });

                // Get last 5 students for the list
                setRecentUsers(students.slice(-5).reverse());
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        if (user) fetchStats();
    }, [user, location.key]); // Added location.key to trigger re-fetch on navigation

    const statCards = [
        { title: 'Total Students', value: stats.students, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { title: 'Total Faculty', value: stats.professors, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { title: 'Active Courses', value: stats.courses, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
        { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    ];

    const quickActions = [
        { label: 'Add User', desc: 'Student/Faculty', icon: UserPlus, path: '/university/users', bg: 'bg-indigo-600', text: 'text-white' },
        { label: 'Curriculum', desc: 'Manage Courses', icon: BookOpen, path: '/university/courses', bg: 'bg-white', text: 'text-slate-700' },
        { label: 'Timetable', desc: 'Class Schedule', icon: Calendar, path: '/university/timetable', bg: 'bg-white', text: 'text-slate-700' },
        { label: 'Security', desc: 'Password & Auth', icon: Shield, path: '/users/change-password', bg: 'bg-white', text: 'text-slate-700' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Hello, {user?.firstName} 👋
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Here's what's happening at your university today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-slate-500 font-medium text-sm">
                    <Clock size={16} />
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* KPI Cards */}
                {statCards.map((card, idx) => (
                    <div key={idx} className={`col-span-1 bg-white p-6 rounded-3xl shadow-sm border ${card.border} hover:shadow-md transition-all group`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3.5 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Realtime</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                            <p className="text-sm font-bold text-slate-400 mt-1">{card.title}</p>
                        </div>
                    </div>
                ))}

                {/* Main Content Area - Full Width since side feed is gone */}
                <div className="col-span-1 md:col-span-4 space-y-8">

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className={`p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between h-32 group ${action.bg} ${action.bg === 'bg-indigo-600' ? 'border-transparent hover:bg-indigo-700' : 'hover:border-indigo-100'}`}
                            >
                                <div className={`self-start p-2 rounded-xl mb-3 ${action.bg === 'bg-indigo-600' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'} transition-colors`}>
                                    <action.icon size={20} />
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${action.text}`}>{action.label}</p>
                                    <p className={`text-xs ${action.bg === 'bg-indigo-600' ? 'text-indigo-100' : 'text-slate-400'}`}>{action.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Notice Board - Spans 2 cols */}
                        <div className="md:col-span-2">
                            <Announcements userRole="UNIVERSITY_ADMIN" />
                        </div>

                        {/* Recent Admissions & Calendar - Spans 1 col */}
                        <div className="space-y-6">
                            {/* Mini Calendar Widget */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-white">
                                        {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <Calendar size={18} className="text-slate-300" />
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
                                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold">
                                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                                        <div key={d} className={`p-1.5 rounded-lg ${d === new Date().getDate() ? 'bg-indigo-500 text-white' : 'hover:bg-slate-700/50 cursor-pointer text-slate-300'}`}>
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compact Recent Users List */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                    <h2 className="text-sm font-bold text-slate-800">New Students</h2>
                                    <button onClick={() => navigate('/university/users')} className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {recentUsers.slice(0, 3).map((u, i) => (
                                        <div key={i} className="p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                                                {u.firstName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-xs truncate">{u.firstName} {u.lastName}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{u.program || 'Student'}</p>
                                            </div>
                                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">New</span>
                                        </div>
                                    ))}
                                    {recentUsers.length === 0 && (
                                        <p className="p-4 text-center text-xs text-slate-400">No recent students.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UniversityAdminDashboard;
