import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    Users, Search, UserPlus, Upload, Filter, MoreVertical, X, Shield, Mail, Phone, Calendar,
    CreditCard, BookOpen, Trash2, Edit, CheckCircle, AlertCircle, Plus, ChevronRight, Download,
    Briefcase, GraduationCap, Layers, User, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper component defined OUTSIDE to prevent re-renders on state change
const InputField = ({ label, type = "text", value, onChange, placeholder, icon: Icon, required = false, options = null }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {Icon && <Icon size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />}
            {options ? (
                <div className="relative">
                    <select
                        value={value}
                        onChange={onChange}
                        className={`w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all p-3 ${Icon ? 'pl-10' : ''} appearance-none`}
                        required={required}
                    >
                        <option value="">Select {label}</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all p-3 ${Icon ? 'pl-10' : ''} placeholder:text-slate-400`}
                    required={required}
                />
            )}
        </div>
    </div>
);

const ManageUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('STUDENT');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);

    // Standardized Options
    const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
    const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'Management', 'Computer Applications', 'Basic Sciences'];
    const PROGRAMS = ['B.Tech', 'M.Tech', 'BBA', 'MBA', 'BCA', 'MCA', 'PhD'];
    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
    const DESIGNATIONS = ['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer', 'HOD', 'Lab Assistant'];
    const EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Visiting', 'Adjunct'];

    const PROGRAM_DEPARTMENT_MAP = {
        'B.Tech': ['CSE', 'ECE', 'ME', 'CE'],
        'M.Tech': ['CSE', 'ECE', 'ME', 'CE'],
        'BCA': ['Computer Applications'],
        'MCA': ['Computer Applications'],
        'BBA': ['Management'],
        'MBA': ['Management'],
        'PhD': ['CSE', 'ECE', 'ME', 'CE', 'Management', 'Computer Applications', 'Basic Sciences']
    };


    const initialFormState = {
        firstName: '', lastName: '', email: '', password: '', role: 'STUDENT',
        academicYear: '2025-2026', gender: '', contactNumber: '', address: '',
        department: '', program: '', semester: '',
        designation: 'Assistant Professor', qualification: '', specialization: '', employmentType: 'Permanent', joiningDate: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (user?.universityId) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/auth/university/${user.universityId}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await api.post('/auth/register', { ...formData, universityId: user.universityId });
            setFormData(initialFormState);
            setIsModalOpen(false);
            fetchUsers();
            toast.success('User created successfully');
        } catch (error) {
            console.error("Error adding user", error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        // Optimistic UI update could happen here, but simplest is wait for server
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            if (selectedUser?._id === id) setSelectedUser(null);
            toast.success('User deleted successfully');
        } catch (error) {
            console.error("Error deleting user", error);
            toast.error('Failed to delete user');
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('universityId', user.universityId);

        setFileUploading(true);
        try {
            await api.post('/users/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Users imported successfully!');
            fetchUsers();
        } catch (error) {
            console.error("Import failed", error);
            toast.error("Import failed: " + (error.response?.data?.message || error.message));
        } finally {
            setFileUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const filteredUsers = users.filter(u =>
        u.role === activeTab &&
        ((u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
    );

    const tabs = [
        { id: 'PROFESSOR', label: 'Faculty', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        { id: 'STUDENT', label: 'Students', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        { id: 'STAFF', label: 'Admin Staff', icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    ];

    const [selectedIds, setSelectedIds] = useState(new Set());

    // Clear selection when tab changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [activeTab]);

    const handleSelectUser = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredUsers.length) {
            setSelectedIds(new Set()); // Deselect All
        } else {
            const allIds = new Set(filteredUsers.map(u => u._id));
            setSelectedIds(allIds);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} users?`)) return;

        try {
            await api.post('/users/delete-selected', {
                userIds: Array.from(selectedIds),
                universityId: user.universityId
            });
            toast.success(`Deleted ${selectedIds.size} users`);
            setSelectedIds(new Set());
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const handleDeleteAllByRole = async () => {
        const roleName = activeTab === 'PROFESSOR' ? 'Faculty' : activeTab === 'STAFF' ? 'Staff' : 'Students';
        if (window.confirm(`⚠️ CRITICAL: Are you sure you want to delete ALL ${roleName}? This action cannot be undone.`)) {
            try {
                const res = await api.delete(`/users/delete-all/${activeTab}`, {
                    data: { universityId: user.universityId }
                });
                toast.success(res.data.message);
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || "Delete failed");
            }
        }
    };

    return (
        <div className="bg-transparent min-h-screen">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">User Directory</h1>
                        <p className="text-slate-500 font-medium">Manage students, faculty, and administrative staff access.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {/* Bulk Actions */}
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-2 bg-rose-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-200 animate-in fade-in zoom-in duration-200"
                            >
                                <Trash2 size={18} /> Delete {selectedIds.size} Selected
                            </button>
                        )}

                        {/* Delete All (Danger Zone - Hidden unless needed or behind menu) - Simplified for modern cleaner look */}

                        <label className={`bg-white border text-slate-600 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition cursor-pointer font-bold shadow-sm hover:shadow-md active:scale-95 duration-200 ${fileUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {fileUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} className="text-emerald-500" />}
                            <span>{fileUploading ? 'Importing...' : 'Import Excel'}</span>
                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={fileUploading} />
                        </label>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2.5 hover:bg-indigo-700 transition font-bold shadow-xl shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 duration-200"
                        >
                            <Plus size={20} className="stroke-[3px]" /> Add User
                        </button>
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="bg-white/70 backdrop-blur-xl p-2 rounded-[20px] shadow-sm border border-white/50 flex flex-col md:flex-row justify-between gap-4 animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
                        {tabs.map(tab => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all duration-300 ${active
                                        ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${active ? (tab.id === 'PROFESSOR' ? 'bg-purple-500' : tab.id === 'STAFF' ? 'bg-emerald-500' : 'bg-indigo-500') : 'bg-slate-300'}`}></div>
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/60 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300"
                            placeholder="Search by name, email, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400 animate-pulse">
                        <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
                        <p className="font-medium">Loading user directory...</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Enhanced Table */}
                        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            <th className="p-6 w-16 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                                                    onChange={handleSelectAll}
                                                    className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                                />
                                            </th>
                                            <th className="p-6">User Profile</th>
                                            <th className="p-6">Academic Info</th>
                                            <th className="p-6">Status & Activity</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                            <Search size={40} className="text-slate-300" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-slate-800 mb-2">No users found</h3>
                                                        <p className="text-slate-500 max-w-sm mb-8">We couldn't find anyone matching your search criteria. Try adjusting your filters.</p>
                                                        <button
                                                            onClick={() => { setSearch(''); setActiveTab('STUDENT') }}
                                                            className="text-indigo-600 font-bold hover:underline"
                                                        >
                                                            Clear all filters
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((u, idx) => (
                                                <tr
                                                    key={u._id}
                                                    onClick={() => setSelectedUser(u)}
                                                    className={`group transition-all duration-200 cursor-pointer hover:bg-slate-50/80 ${selectedIds.has(u._id) ? 'bg-indigo-50/60' : ''}`}
                                                    style={{ animationDelay: `${idx * 50}ms` }}
                                                >
                                                    <td className="p-6 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(u._id)}
                                                            onChange={() => handleSelectUser(u._id)}
                                                            className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ring-4 ring-white transition-transform group-hover:scale-110 ${u.role === 'PROFESSOR' ? 'bg-purple-100 text-purple-600' :
                                                                    u.role === 'STAFF' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                                                }`}>
                                                                {u.firstName[0]}{u.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-base">{u.firstName} {u.lastName}</p>
                                                                <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500">
                                                                    <Mail size={14} className="text-slate-400" />
                                                                    <span className="truncate max-w-[180px]">{u.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            {u.department ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide w-fit border border-slate-200">
                                                                    <Layers size={12} /> {u.department}
                                                                </span>
                                                            ) : <span className="text-slate-400 text-xs italic">Unassigned Dept</span>}

                                                            <span className="text-sm font-medium text-slate-600 pl-1">
                                                                {u.program ? `${u.program} • Sem ${u.semester}` : u.designation || 'General Details'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${u.email ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                                <span className="text-sm font-bold text-slate-700">{u.role}</span>
                                                            </div>
                                                            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                                                                ID: {u.role === 'STUDENT' ? u.rollNumber || 'TBD' : u.facultyId || 'TBD'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <button
                                                                onClick={() => setSelectedUser(u)}
                                                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95"
                                                                title="View Profile"
                                                            >
                                                                <User size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(u._id)}
                                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Summary */}
                            <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span>Total {tabs.find(t => t.id === activeTab)?.label}: {filteredUsers.length}</span>
                                <span>Selected: {selectedIds.size}</span>
                            </div>
                        </div>
                    </div>
                )}


                {/* Create User Modal - Modern Backdrop */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-white/20">

                            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New User</h2>
                                    <p className="text-slate-500 font-medium text-sm">Add a new member to the university database.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-8 space-y-8">
                                {/* Role Selection Pills */}
                                <div className="p-1.5 bg-slate-100 rounded-2xl flex gap-1">
                                    {['STUDENT', 'PROFESSOR', 'STAFF'].map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setFormData({ ...initialFormState, role })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${formData.role === role ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:bg-black/5'}`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputField label="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required icon={User} placeholder="e.g. John" />
                                        <InputField label="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required icon={User} placeholder="e.g. Doe" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputField label="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required icon={Mail} placeholder="john@university.edu" />
                                        <InputField label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required icon={Shield} placeholder="••••••••" />
                                    </div>

                                    <div className="border-t border-slate-100 my-6"></div>

                                    {/* Dynamic Role Fields */}
                                    {formData.role === 'STUDENT' && (
                                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center gap-3 text-indigo-600 mb-2">
                                                <GraduationCap size={20} />
                                                <h3 className="font-bold text-sm uppercase tracking-widest">Academic Details</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <InputField label="Program" value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value, department: '' })} required options={PROGRAMS} />
                                                <InputField label="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required options={formData.program ? (PROGRAM_DEPARTMENT_MAP[formData.program] || []) : []} placeholder={formData.program ? "Select Department" : "Select Program First"} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <InputField label="Semester" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} required options={SEMESTERS} />
                                                <InputField label="Academic Year" value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} required options={ACADEMIC_YEARS} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <InputField label="Date of Birth" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} icon={Calendar} />
                                                <InputField label="Gender" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} options={['Male', 'Female', 'Other']} />
                                            </div>
                                        </div>
                                    )}

                                    {formData.role === 'PROFESSOR' && (
                                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center gap-3 text-purple-600 mb-2">
                                                <Briefcase size={20} />
                                                <h3 className="font-bold text-sm uppercase tracking-widest">Faculty Details</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <InputField label="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required options={DEPARTMENTS} />
                                                <InputField label="Designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} required options={DESIGNATIONS} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <InputField label="Qualification" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} placeholder="e.g. PhD in CS" />
                                                <InputField label="Specialization" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g. AI/ML" />
                                            </div>
                                        </div>
                                    )}

                                    {formData.role === 'STAFF' && (
                                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                                <User size={20} />
                                                <h3 className="font-bold text-sm uppercase tracking-widest">Staff Details</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <InputField label="Department/Office" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required options={[...DEPARTMENTS, 'Administration', 'Accounts', 'Library', 'Registrar Office']} />
                                                <InputField label="Designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} required placeholder="e.g. Clerk, Accountant" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition active:scale-95 duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-4 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition active:scale-95 duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                                        {isCreating ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Detail View Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedUser(null)}></div>
                        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative overflow-hidden animate-in zoom-in-95 duration-300">

                            {/* Header Gradient */}
                            <div className={`h-40 w-full relative ${selectedUser.role === 'PROFESSOR' ? 'bg-gradient-to-br from-purple-600 to-indigo-800' : selectedUser.role === 'STAFF' ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition backdrop-blur-md"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            </div>

                            <div className="px-8 pb-8 relative -mt-16">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="p-1.5 bg-white rounded-[24px] shadow-2xl relative z-10 mb-4">
                                        <div className={`w-28 h-28 rounded-[18px] flex items-center justify-center text-4xl font-bold ${selectedUser.role === 'PROFESSOR' ? 'bg-purple-50 text-purple-600' :
                                                selectedUser.role === 'STAFF' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                    <p className="text-slate-500 font-medium">{selectedUser.email}</p>

                                    <div className="flex gap-2 mt-4">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedUser.role === 'PROFESSOR' ? 'bg-purple-100 text-purple-700' :
                                                selectedUser.role === 'STAFF' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {selectedUser.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <Briefcase size={14} /> Academic / Professional
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Department</p>
                                                <p className="font-bold text-slate-800">{selectedUser.department || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">ID Number</p>
                                                <p className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border inline-block text-xs mt-0.5">
                                                    {selectedUser.role === 'STUDENT' ? selectedUser.rollNumber || 'PENDING' : selectedUser.facultyId || 'PENDING'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <Phone size={14} /> Contact Information
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                                <span className="text-sm font-medium text-slate-500">Email</span>
                                                <span className="text-sm font-bold text-slate-800">{selectedUser.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-slate-500">Phone</span>
                                                <span className="text-sm font-bold text-slate-800">{selectedUser.contactNumber || 'Not provided'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(selectedUser._id)}
                                    className="w-full mt-8 py-4 rounded-xl border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                >
                                    <Trash2 size={18} /> Delete User Access
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
