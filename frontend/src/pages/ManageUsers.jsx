import React, { useState, useEffect } from 'react';
import api from '../api/client';

import { useAuth } from '../context/AuthContext';
import { Search, Plus, Trash2, User, Mail, Shield, Upload } from 'lucide-react';

const ManageUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' });

    useEffect(() => {
        if (user?.schoolId) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const response = await api.get(`/auth/school/${user.schoolId}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { ...formData, schoolId: user.schoolId });
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' });
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Error adding user", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user", error);
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('schoolId', user.schoolId);

        try {
            await api.post('/users/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Users imported successfully!');
            fetchUsers();
        } catch (error) {
            console.error("Import failed", error);
            alert("Import failed: " + (error.response?.data?.message || error.message));
        }
    };

    const filteredUsers = users.filter(u =>
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

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
                    <div key={u._id} className="bg-white p-6 rounded-lg shadow border border-gray-100 hover:shadow-lg transition relative group">
                        <button
                            onClick={() => handleDelete(u._id)}
                            className="absolute top-4 right-4 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            title="Delete User"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${u.role === 'TEACHER' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{u.firstName} {u.lastName}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${u.role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
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
                                    <option value="TEACHER">Teacher</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition mt-2">Create User</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
