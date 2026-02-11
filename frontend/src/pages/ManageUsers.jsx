import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    Users, Search, UserPlus, Upload, Filter, MoreVertical, X, Shield, Mail, Phone, Calendar,
    CreditCard, BookOpen, Trash2, Edit, CheckCircle, AlertCircle, Plus, ChevronRight, Download,
    Briefcase, GraduationCap, Layers, User
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper component defined OUTSIDE to prevent re-renders on state change
const InputField = ({ label, type = "text", value, onChange, placeholder, icon: Icon, required = false, options = null }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {Icon && <Icon size={18} className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
            {options ? (
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
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all p-2.5 ${Icon ? 'pl-10' : ''}`}
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
        try {
            const response = await api.get(`/auth/university/${user.universityId}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { ...formData, universityId: user.universityId });
            setFormData(initialFormState);
            setIsModalOpen(false);
            fetchUsers();
            toast.success('User created successfully');
        } catch (error) {
            console.error("Error adding user", error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
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

        try {
            await api.post('/users/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Users imported successfully!');
            fetchUsers();
        } catch (error) {
            console.error("Import failed", error);
            toast.error("Import failed: " + (error.response?.data?.message || error.message));
        }
    };

    const filteredUsers = users.filter(u =>
        u.role === activeTab &&
        ((u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
    );

    const tabs = [
        { id: 'PROFESSOR', label: 'Faculty', icon: Briefcase },
        { id: 'STUDENT', label: 'Students', icon: GraduationCap },
        { id: 'STAFF', label: 'Admin Staff', icon: User },
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
        <div className="bg-transparent">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                        <p className="text-slate-500 mt-1">Manage admissions, faculty, and system access.</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Bulk Delete Selected */}
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg animate-in fade-in zoom-in duration-200"
                            >
                                <Trash2 size={18} /> Delete Selected ({selectedIds.size})
                            </button>
                        )}

                        {/* Delete All by Role */}
                        <button
                            onClick={handleDeleteAllByRole}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition border border-red-100"
                        >
                            <Trash2 size={18} /> Delete All {activeTab === 'PROFESSOR' ? 'Faculty' : activeTab === 'STAFF' ? 'Staff' : 'Students'}
                        </button>

                        <label className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition cursor-pointer font-medium shadow-sm hover:shadow-md">
                            <Upload size={18} className="text-emerald-500" />
                            <span>Import Excel</span>
                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200"
                        >
                            <Plus size={20} /> Add User
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-2">
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            className="w-full h-full pl-12 pr-4 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Grid */}
                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="p-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                    </th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role & ID</th>
                                    <th className="p-4">Academic Info</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-slate-50 p-4 rounded-full">
                                                    <Search size={24} />
                                                </div>
                                                <p className="font-medium">No users found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr
                                            key={u._id}
                                            onClick={() => setSelectedUser(u)}
                                            className={`group transition-all hover:bg-slate-50 cursor-pointer ${selectedIds.has(u._id) ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''}`}
                                        >
                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(u._id)}
                                                    onChange={() => handleSelectUser(u._id)}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${u.role === 'PROFESSOR' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                        {u.firstName[0]}{u.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700">{u.firstName} {u.lastName}</p>
                                                        <p className="text-xs text-slate-400 font-mono">Added: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${u.role === 'PROFESSOR' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                        u.role === 'STAFF' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                    <span className="text-xs font-mono text-slate-500">
                                                        {u.role === 'STUDENT' ? u.rollNumber || 'No Roll #' : u.facultyId || 'No ID'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600">
                                                    {u.department && (
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <Layers size={14} className="text-slate-400" />
                                                            <span className="font-medium">{u.department}</span>
                                                        </div>
                                                    )}
                                                    {u.program && (
                                                        <div className="flex items-center gap-1.5">
                                                            <BookOpen size={14} className="text-slate-400" />
                                                            <span>{u.program} - Sem {u.semester}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600 space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail size={14} className="text-slate-400" />
                                                        <span className="truncate max-w-[150px] block" title={u.email}>{u.email}</span>
                                                    </div>
                                                    {u.contactNumber && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone size={14} className="text-slate-400" />
                                                            <span>{u.contactNumber}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleDelete(u._id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination or Footer Summary could go here */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
                        <span>Showing {filteredUsers.length} users</span>
                        <span>Selected: {selectedIds.size}</span>
                    </div>
                </div>

                {/* Create User Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Create New User</h2>
                                    <p className="text-slate-500 text-sm">Enter the details to register a new user.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-8 space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b pb-2">Account Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required icon={User} />
                                        <InputField label="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required icon={User} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required icon={Mail} />
                                        <InputField label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required icon={Shield} />
                                    </div>
                                    <InputField label="User Role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required options={['STUDENT', 'PROFESSOR', 'STAFF']} />
                                </div>

                                {/* Student Specific */}
                                {formData.role === 'STUDENT' && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Academic Enrolment</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                label="Program"
                                                value={formData.program}
                                                onChange={e => setFormData({ ...formData, program: e.target.value, department: '' })}
                                                required
                                                options={PROGRAMS}
                                            />
                                            <InputField
                                                label="Department"
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                required
                                                options={formData.program ? (PROGRAM_DEPARTMENT_MAP[formData.program] || []) : []}
                                                placeholder={formData.program ? "Select Department" : "Select Program First"}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Semester" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} required options={SEMESTERS} />
                                            <InputField label="Academic Year" value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} required options={ACADEMIC_YEARS} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Date of Birth" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                            <InputField label="Gender" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} options={['Male', 'Female', 'Other']} />
                                        </div>
                                    </div>
                                )}

                                {/* Professor Specific */}
                                {formData.role === 'PROFESSOR' && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-2">Faculty Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required options={DEPARTMENTS} />
                                            <InputField label="Designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} required options={DESIGNATIONS} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Qualification" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} placeholder="e.g. PhD in CS" />
                                            <InputField label="Specialization" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g. AI/ML" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Employment Type" value={formData.employmentType} onChange={e => setFormData({ ...formData, employmentType: e.target.value })} options={EMPLOYMENT_TYPES} />
                                            <InputField label="Joining Date" type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {/* Staff Specific */}
                                {formData.role === 'STAFF' && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">Staff Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Department/Office" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required options={[...DEPARTMENTS, 'Administration', 'Accounts', 'Library', 'Registrar Office']} />
                                            <InputField label="Designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} required placeholder="e.g. Clerk, Accountant" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Employment Type" value={formData.employmentType} onChange={e => setFormData({ ...formData, employmentType: e.target.value })} options={EMPLOYMENT_TYPES} />
                                            <InputField label="Joining Date" type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
                                    <button type="submit" className="flex-1 py-3.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Create User</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Profile Detail Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>

                            <div className={`h-40 w-full relative ${selectedUser.role === 'PROFESSOR' ? 'bg-gradient-to-br from-purple-600 to-indigo-800' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
                            </div>

                            <div className="px-8 pb-8 relative -mt-16">
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-xl relative z-10">
                                        <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold border-4 border-slate-50 ${selectedUser.role === 'PROFESSOR' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'}`}>
                                            {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                        </div>
                                    </div>
                                    <div className="text-center mt-4">
                                        <h2 className="text-3xl font-bold text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedUser.role === 'PROFESSOR' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>
                                                {selectedUser.role}
                                            </span>
                                            {selectedUser.department && <span className="text-slate-500 font-medium">| {selectedUser.department}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold uppercase text-xs">
                                            <Mail size={14} /> Contact
                                        </div>
                                        <p className="text-slate-800 font-medium truncate">{selectedUser.email}</p>
                                        <p className="text-slate-500 text-sm mt-1">{selectedUser.contactNumber || 'No Phone'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold uppercase text-xs">
                                            <Shield size={14} /> System ID
                                        </div>
                                        <p className="text-slate-800 font-mono text-sm">{selectedUser._id}</p>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {selectedUser.role === 'STUDENT' ? (
                                                <>
                                                    <span className="block font-bold text-indigo-600">
                                                        Section: {selectedUser.section || 'Unassigned'}
                                                    </span>
                                                    <span>Roll: {selectedUser.rollNumber || 'Pending'}</span>
                                                </>
                                            ) : (
                                                `ID: ${selectedUser.facultyId || 'N/A'}`
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(selectedUser._id)}
                                    className="w-full mt-6 py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} /> Delete User
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
