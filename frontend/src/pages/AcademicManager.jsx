import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, BookOpen, Layers, Award, Hash, CheckCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicManager = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('sections'); // sections, rolls, promote
    const [stats, setStats] = useState([]);

    // Form States
    const [sectionForm, setSectionForm] = useState({ program: '', semester: '', maxCapacity: 60 });
    const [rollForm, setRollForm] = useState({ program: '', semester: '' });
    const [promoteForm, setPromoteForm] = useState({ program: '', currentSemester: '', nextSemester: '' });
    const [promoteStudents, setPromoteStudents] = useState([]);

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

    const handlePromote = async (e) => {
        e.preventDefault();
        if (!window.confirm("This will promote students and archive current data. Continue?")) return;

        setLoading(true);
        try {
            // Needed: Fetch students eligible for promotion first?
            // For now, this is a distinct action - usually we'd select students first.
            // Simplified: Promote ALL in that Sem/Program
            toast.error("Please implement student selection logic first!");
        } catch (error) {
            toast.error("Failed");
        }
        setLoading(false);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Academic Core</h1>
            <p className="text-slate-500 mb-8">Manage Sections, Roll Numbers, and Semester Progression.</p>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.slice(0, 3).map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{stat._id.program}</h3>
                                <p className="text-sm font-medium text-slate-400">Semester {stat._id.semester}</p>
                            </div>
                            <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">
                                {stat.count} Students
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Unassigned Sections</span>
                                <span className={`font-bold ${stat.unassignedSection > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{stat.unassignedSection}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">No Roll Number</span>
                                <span className={`font-bold ${stat.unassignedRoll > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{stat.unassignedRoll}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Interface */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100">
                    <button onClick={() => setActiveTab('sections')} className={`px-8 py-4 font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'sections' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Layers size={18} /> Sectioning
                    </button>
                    <button onClick={() => setActiveTab('rolls')} className={`px-8 py-4 font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'rolls' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Hash size={18} /> Roll Numbers
                    </button>
                    <button onClick={() => setActiveTab('promote')} className={`px-8 py-4 font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'promote' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Award size={18} /> Progression
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'sections' && (
                        <div className="max-w-xl">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Auto-Assign Sections</h2>
                            <p className="text-sm text-slate-500 mb-6">Automatically distributes unassigned students into sections (A, B, C...) based on capacity.</p>

                            <form onSubmit={handleAssignSections} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Program</label>
                                    <input type="text" value={sectionForm.program} onChange={e => setSectionForm({ ...sectionForm, program: e.target.value })} className="w-full border p-2.5 rounded-xl text-sm" placeholder="e.g. B.Tech" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                                        <input type="number" value={sectionForm.semester} onChange={e => setSectionForm({ ...sectionForm, semester: e.target.value })} className="w-full border p-2.5 rounded-xl text-sm" placeholder="e.g. 1" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Max Capacity</label>
                                        <input type="number" value={sectionForm.maxCapacity} onChange={e => setSectionForm({ ...sectionForm, maxCapacity: e.target.value })} className="w-full border p-2.5 rounded-xl text-sm" placeholder="60" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                    {loading ? <RefreshCcw className="animate-spin" /> : <CheckCircle size={20} />}
                                    Run Assignment
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'rolls' && (
                        <div className="max-w-xl">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Generate Roll Numbers</h2>
                            <p className="text-sm text-slate-500 mb-6">Generates sequential roll numbers (e.g. A-01, A-02) for students with assigned sections.</p>
                            <form onSubmit={handleGenerateRolls} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Program</label>
                                    <input type="text" value={rollForm.program} onChange={e => setRollForm({ ...rollForm, program: e.target.value })} className="w-full border p-2.5 rounded-xl text-sm" placeholder="e.g. B.Tech" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                                    <input type="number" value={rollForm.semester} onChange={e => setRollForm({ ...rollForm, semester: e.target.value })} className="w-full border p-2.5 rounded-xl text-sm" placeholder="e.g. 1" required />
                                </div>
                                <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                                    {loading ? <RefreshCcw className="animate-spin" /> : <Hash size={20} />}
                                    Generate Sequence
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'promote' && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Use with Caution</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-6">Promotion logic is sensitive. It archives current semester data and resets roll numbers.</p>
                            <button className="bg-slate-100 text-slate-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed">
                                Feature Locked (In Development)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcademicManager;
