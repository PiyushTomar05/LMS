import React, { useState, useEffect } from 'react';
import api from '../api/client';

import { useAuth } from '../context/AuthContext';
import { Search, Plus, Trash2, User, Mail, Shield, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' });
    const [activeTab, setActiveTab] = useState('STUDENT'); // Tabs: PROFESSOR, STUDENT, STAFF

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
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' });
            setIsModalOpen(false);
            fetchUsers();
            toast.success('User created successfully');
        } catch (error) {
            console.error("Error adding user", error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
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
        { id: 'PROFESSOR', label: 'Teachers' },
        { id: 'STUDENT', label: 'Students' },
        { id: 'STAFF', label: 'Staff' },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
                <div className="flex gap-2">
                    <label className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition cursor-pointer">
                        <Upload size={20} /> Import Excel
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={20} /> Add User
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2 px-4 font-semibold transition-colors relative ${activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded shadow mb-6 flex items-center gap-4">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-gray-500 text-sm font-semibold">
                    Total Users: {users.length}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(u => (
                    <div
                        key={u._id}
                        onClick={() => setSelectedUser(u)}
                        className="bg-white p-6 rounded-lg shadow border border-gray-100 hover:shadow-lg transition relative group cursor-pointer"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(u._id); }}
                            className="absolute top-4 right-4 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            title="Delete User"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${u.role === 'PROFESSOR' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{u.firstName} {u.lastName}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${u.role === 'PROFESSOR' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {u.role}
                                </span>
                            </div>
                        </div>

                        <div className="text-gray-500 text-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{u.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={16} />
                                <span>ID: {u._id.substring(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Add New User</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                                <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                            </div>
                            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                            <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="STUDENT">Student</option>
                                    <option value="PROFESSOR">Professor</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                            </div>

                            {/* SIS Fields for Students */}
                            {formData.role === 'STUDENT' && (
                                <div className="space-y-4 animate-fade-in bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="font-bold text-gray-700 text-sm uppercase">Student Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Roll Number" value={formData.rollNumber || ''} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} className="border p-2 rounded text-sm" />
                                        <input type="text" placeholder="Department" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} className="border p-2 rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Program (e.g. B.Tech)" value={formData.program || ''} onChange={e => setFormData({ ...formData, program: e.target.value })} className="border p-2 rounded text-sm" />
                                        <input type="number" placeholder="Semester" value={formData.semester || ''} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="border p-2 rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="date" placeholder="DOB" value={formData.dob || ''} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="border p-2 rounded text-sm" />
                                        <select value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="border p-2 rounded text-sm">
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <input type="text" placeholder="Contact Number" value={formData.contactNumber || ''} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} className="border p-2 rounded text-sm w-full" />
                                    <textarea placeholder="Address" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="border p-2 rounded text-sm w-full" rows="2"></textarea>
                                </div>
                            )}

                            {/* Faculty Fields for Professors */}
                            {formData.role === 'PROFESSOR' && (
                                <div className="space-y-4 animate-fade-in bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <h3 className="font-bold text-purple-800 text-sm uppercase">Faculty Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select value={formData.designation || 'Assistant Professor'} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="border p-2 rounded text-sm">
                                            <option value="Assistant Professor">Assistant Professor</option>
                                            <option value="Associate Professor">Associate Professor</option>
                                            <option value="Professor">Professor</option>
                                            <option value="Lecturer">Lecturer</option>
                                            <option value="Head of Department">Head of Department</option>
                                        </select>
                                        <input type="text" placeholder="Department" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} className="border p-2 rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Qualification (e.g. PhD)" value={formData.qualification || ''} onChange={e => setFormData({ ...formData, qualification: e.target.value })} className="border p-2 rounded text-sm" />
                                        <input type="text" placeholder="Specialization" value={formData.specialization || ''} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="border p-2 rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select value={formData.employmentType || 'Permanent'} onChange={e => setFormData({ ...formData, employmentType: e.target.value })} className="border p-2 rounded text-sm">
                                            <option value="Permanent">Permanent</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Visiting">Visiting</option>
                                        </select>
                                        <input type="date" placeholder="Joining Date" value={formData.joiningDate || ''} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} className="border p-2 rounded text-sm" />
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition mt-2">Create User</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden transform transition-all scale-100">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition backdrop-blur-md"
                        >
                            <Trash2 size={0} className="hidden" /> {/* Keep import valid */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        {/* Header Background */}
                        <div className={`h-40 w-full relative ${selectedUser.role === 'PROFESSOR' ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800' : 'bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500'}`}>
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Profile Content */}
                        <div className="px-8 pb-8 relative -mt-16">
                            <div className="flex flex-col items-center">
                                {/* Avatar */}
                                <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-xl relative z-10">
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold border-4 border-slate-50 ${selectedUser.role === 'PROFESSOR' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'
                                        }`}>
                                        {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                    </div>
                                    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${selectedUser.role === 'PROFESSOR' ? 'bg-purple-500' : 'bg-green-500'
                                        }`} title="Active"></div>
                                </div>

                                <div className="text-center mt-4 mb-8">
                                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${selectedUser.role === 'PROFESSOR' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-sky-100 text-sky-700 border border-sky-200'
                                            }`}>
                                            {selectedUser.role}
                                        </span>
                                        {selectedUser.department && (
                                            <span className="text-slate-500 font-medium text-sm flex items-center gap-1">
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                {selectedUser.department}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Info Card */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Contact Details</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Email Address</p>
                                            <p className="text-slate-700 font-medium truncate" title={selectedUser.email}>{selectedUser.email}</p>
                                        </div>
                                        {selectedUser.contactNumber ? (
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                                                <p className="text-slate-700 font-medium">{selectedUser.contactNumber}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                                                <p className="text-slate-400 italic text-sm">Not provided</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">System ID</p>
                                            <p className="font-mono text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded w-fit mt-1">{selectedUser._id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Info Card */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-purple-500 transition-colors">
                                            <Shield size={18} />
                                        </div>
                                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Academic Info</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedUser.role === 'PROFESSOR' && (
                                            <>
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-medium">Faculty ID</p>
                                                        <p className="text-slate-700 font-semibold">{selectedUser.facultyId || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400 font-medium">Designation</p>
                                                        <p className="text-slate-700 font-medium">{selectedUser.designation}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Qualification</p>
                                                    <p className="text-slate-700 font-medium">{selectedUser.qualification || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Joining Date</p>
                                                    <p className="text-slate-700 font-medium">{selectedUser.joiningDate ? new Date(selectedUser.joiningDate).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </>
                                        )}

                                        {selectedUser.role === 'STUDENT' && (
                                            <>
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-medium">URN</p>
                                                        <p className="text-slate-700 font-semibold">{selectedUser.urn || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400 font-medium">Roll No.</p>
                                                        <p className="text-slate-700 font-medium">{selectedUser.rollNumber || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Program</p>
                                                    <p className="text-slate-700 font-medium">{selectedUser.program || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Current Semester</p>
                                                    <p className="text-slate-700 font-medium">{selectedUser.semester ? `Semester ${selectedUser.semester}` : 'N/A'}</p>
                                                </div>
                                            </>
                                        )}

                                        {selectedUser.role === 'STAFF' && (
                                            <p className="text-slate-400 italic text-sm py-4 text-center">No additional academic details.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedUser.address && (
                                <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                                    <div className="min-w-fit mt-0.5 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase mb-0.5">Address</p>
                                        <p className="text-slate-700 text-sm leading-relaxed">{selectedUser.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
