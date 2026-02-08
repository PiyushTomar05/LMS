import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Trash2, Megaphone, Send, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Announcements = ({ userRole }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', audience: 'ALL' });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', newAnnouncement);
            setNewAnnouncement({ title: '', content: '', audience: 'ALL' });
            setShowForm(false);
            fetchAnnouncements();
            toast.success("Announcement posted successfully!");
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to post announcement";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
            toast.success("Announcement deleted!");
        } catch (error) {
            toast.error("Failed to delete announcement");
        }
    };

    const getAudienceBadge = (audience) => {
        switch (audience) {
            case 'TEACHERS': return { label: 'Faculty Only', classes: 'bg-purple-100 text-purple-700 border-purple-200' };
            case 'STUDENTS': return { label: 'Students Only', classes: 'bg-blue-100 text-blue-700 border-blue-200' };
            default: return { label: 'Everyone', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl shadow-sm border border-indigo-100/50">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 transform rotate-3">
                        <Megaphone size={24} className="animate-pulse-slow" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Notice Board</h2>
                        <p className="text-sm font-medium text-slate-500">Latest updates & announcements</p>
                    </div>
                </div>
                {(userRole === 'UNIVERSITY_ADMIN' || userRole === 'SCHOOL_ADMIN') && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${showForm
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-0.5'
                            }`}
                    >
                        {showForm ? <><X size={18} /> Cancel</> : <><Send size={18} /> Post Notice</>}
                    </button>
                )}
            </div>

            {/* Create Form */}
            <div className={`transition-all duration-300 overflow-hidden ${showForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-dashed border-indigo-200 shadow-inner">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="Enter notice title..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-semibold text-slate-700"
                                value={newAnnouncement.title}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
                            <textarea
                                placeholder="Type your message here..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32 text-slate-600 resize-none"
                                value={newAnnouncement.content}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audience</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                                    value={newAnnouncement.audience}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}
                                >
                                    <option value="ALL">Everyone (Students & Faculty)</option>
                                    <option value="TEACHERS">Faculty Members Only</option>
                                    <option value="STUDENTS">Students Only</option>
                                </select>
                            </div>
                            <div className="mt-5">
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                    Post Now <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-slate-400 font-medium text-sm">Loading updates...</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                            <Megaphone size={30} />
                        </div>
                        <p className="text-slate-500 font-medium">No announcements yet.</p>
                        <p className="text-slate-400 text-sm">Post a notice to get started.</p>
                    </div>
                ) : (
                    announcements.map(ann => {
                        const badge = getAudienceBadge(ann.audience);
                        return (
                            <div key={ann._id} className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm">
                                            {ann.postedBy.firstName ? ann.postedBy.firstName[0] : 'A'}
                                        </div>
                                        <div>
                                            <h3 className="font-exrabold text-slate-800 text-lg leading-tight group-hover:text-indigo-700 transition-colors">{ann.title}</h3>
                                            <p className="text-xs font-medium text-slate-400">
                                                By <span className="text-slate-600">{ann.postedBy.firstName} {ann.postedBy.lastName}</span> • {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide border ${badge.classes}`}>
                                        {badge.label}
                                    </span>
                                </div>
                                <div className="pl-[52px]">
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-50 group-hover:bg-white group-hover:border-slate-100 transition-colors">
                                        {ann.content}
                                    </p>
                                </div>
                                {(userRole === 'SCHOOL_ADMIN' || userRole === 'UNIVERSITY_ADMIN') && (
                                    <button
                                        onClick={() => handleDelete(ann._id)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Delete Announcement"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Announcements;
