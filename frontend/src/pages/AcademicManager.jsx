import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    Users, BookOpen, Layers, Award, Hash, CheckCircle, RefreshCcw, AlertCircle,
    ArrowRight, PieChart, GraduationCap, School
} from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicManager = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('sections'); // sections, rolls, promote
    const [stats, setStats] = useState([]);

    // Standardized Options
    const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
    const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'Management', 'Computer Applications', 'Basic Sciences'];
    const PROGRAMS = ['B.Tech', 'M.Tech', 'BBA', 'MBA', 'BCA', 'MCA', 'PhD'];
    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

    // Form States
    const [sectionForm, setSectionForm] = useState({ program: '', department: '', semester: '', maxCapacity: 60 });
    const [rollForm, setRollForm] = useState({ program: '', department: '', semester: '', section: '' }); // Added section
    const [availableSections, setAvailableSections] = useState([]); // Dynamic sections

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await api.get(`/academic/stats/${user.universityId}`);
            setStats(res.data);
        } catch (error) {
            console.error("Stats error", error);
        }
    };

    // Fetch sections when rollForm filters change
    useEffect(() => {
        if (rollForm.program && rollForm.department && rollForm.semester) {
            fetchSections();
        } else {
            setAvailableSections([]);
        }
    }, [rollForm.program, rollForm.department, rollForm.semester]);

    const fetchSections = async () => {
        try {
            const res = await api.get('/academic/sections', {
                params: {
                    universityId: user.universityId,
                    program: rollForm.program,
                    department: rollForm.department,
                    semester: rollForm.semester
                }
            });
            setAvailableSections(res.data);
        } catch (error) {
            console.error("Error fetching sections", error);
            setAvailableSections([]);
        }
    };

    const handleAssignSections = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/academic/sections', {
                universityId: user.universityId,
                ...sectionForm,
                semester: Number(sectionForm.semester),
                academicYear: '2025-2026' // Should be dynamic
            });
            toast.success(res.data.message);
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed");
        }
        setLoading(false);
    };

    const handleGenerateRolls = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/academic/roll-numbers', {
                universityId: user.universityId,
                ...rollForm,
                semester: Number(rollForm.semester)
            });
            toast.success(res.data.message);
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed");
        }
        setLoading(false);
    };

    const InputSelect = ({ label, value, onChange, options, icon: Icon, required = false }) => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                {Icon && <Icon size={18} className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
                <select
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all p-2.5 ${Icon ? 'pl-10' : ''}`}
                    required={required}
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Academic Core</h1>
                <p className="text-slate-500 mb-8">Manage Sections, Roll Numbers, and Semester Progression.</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.slice(0, 4).map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 group-hover:bg-indigo-100 transition"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">{stat._id.program}</span>
                                    <span className="font-bold text-slate-400">Sem {stat._id.semester}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.count}</h3>
                                <p className="text-slate-400 text-sm">Total Students</p>

                                <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs">
                                    <div className="text-slate-500">Unassigned: <strong className={stat.unassignedSection > 0 ? "text-amber-500" : "text-emerald-500"}>{stat.unassignedSection}</strong></div>
                                    <div className="text-slate-500 text-right">No Roll: <strong className={stat.unassignedRoll > 0 ? "text-red-500" : "text-emerald-500"}>{stat.unassignedRoll}</strong></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Action Area */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                    {/* Sidebar Nav */}
                    <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
                        <button onClick={() => setActiveTab('sections')} className={`p-4 rounded-xl font-bold text-sm text-left flex items-center gap-3 transition-all ${activeTab === 'sections' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <Layers size={20} /> Sectioning
                        </button>
                        <button onClick={() => setActiveTab('rolls')} className={`p-4 rounded-xl font-bold text-sm text-left flex items-center gap-3 transition-all ${activeTab === 'rolls' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <Hash size={20} /> Roll Numbers
                        </button>
                        <button onClick={() => setActiveTab('promote')} className={`p-4 rounded-xl font-bold text-sm text-left flex items-center gap-3 transition-all ${activeTab === 'promote' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <Award size={20} /> Progression
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 md:p-12">

                        {activeTab === 'sections' && (
                            <div className="max-w-xl animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                        <Layers size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Assign Sections</h2>
                                        <p className="text-slate-500">Distribute students into sections based on capacity.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAssignSections} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputSelect label="Program" value={sectionForm.program} onChange={e => setSectionForm({ ...sectionForm, program: e.target.value })} options={PROGRAMS} icon={GraduationCap} required />
                                        <InputSelect label="Department" value={sectionForm.department} onChange={e => setSectionForm({ ...sectionForm, department: e.target.value })} options={DEPARTMENTS} icon={School} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputSelect label="Semester" value={sectionForm.semester} onChange={e => setSectionForm({ ...sectionForm, semester: e.target.value })} options={SEMESTERS} icon={BookOpen} required />

                                        <div className="flex flex-col gap-1.5 w-full">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Capacity</label>
                                            <input
                                                type="number"
                                                value={sectionForm.maxCapacity}
                                                onChange={e => setSectionForm({ ...sectionForm, maxCapacity: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all p-2.5"
                                                placeholder="60"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                                        {loading ? <RefreshCcw className="animate-spin" /> : <CheckCircle size={20} />}
                                        Run Auto-Assignment
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'rolls' && (
                            <div className="max-w-xl animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                        <Hash size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Generate Roll Numbers</h2>
                                        <p className="text-slate-500">Generate sequential IDs (e.g. A-01) for assigned students.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleGenerateRolls} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputSelect label="Program" value={rollForm.program} onChange={e => setRollForm({ ...rollForm, program: e.target.value })} options={PROGRAMS} icon={GraduationCap} required />
                                        <InputSelect label="Department" value={rollForm.department} onChange={e => setRollForm({ ...rollForm, department: e.target.value })} options={DEPARTMENTS} icon={School} required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <InputSelect label="Target Semester" value={rollForm.semester} onChange={e => setRollForm({ ...rollForm, semester: e.target.value })} options={SEMESTERS} icon={BookOpen} required />
                                        <InputSelect
                                            label="Target Section"
                                            value={rollForm.section}
                                            onChange={e => setRollForm({ ...rollForm, section: e.target.value })}
                                            options={availableSections.length > 0 ? availableSections : ['No Sections Found']}
                                            icon={Layers}
                                        />
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                                        {loading ? <RefreshCcw className="animate-spin" /> : <Hash size={20} />}
                                        Generate Sequence
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'promote' && (
                            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                                    <AlertCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Advanced Feature</h3>
                                <p className="text-slate-500 max-w-md mb-8">Semester promotion involves complex data archiving. This feature is currently locked ensuring system stability.</p>
                                <button className="bg-slate-100 text-slate-400 px-8 py-3 rounded-xl font-bold cursor-not-allowed">
                                    feature_locked_by_admin
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademicManager;
