import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Plus, Search, Trash2, School as SchoolIcon, X, Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ManageSchools = () => {
    const [schools, setSchools] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [newSchool, setNewSchool] = useState({
        name: '',
        address: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: ''
    });

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const response = await api.get('/schools');
            setSchools(response.data);
        } catch (error) {
            console.error("Error fetching schools", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/schools', newSchool);
            setNewSchool({
                name: '', address: '',
                adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: ''
            });
            setIsModalOpen(false);
            fetchSchools();
        } catch (error) {
            console.error("Error creating school", error);
            alert("Error creating school: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this school?")) return;
        try {
            await api.delete(`/schools/${id}`);
            fetchSchools();
        } catch (error) {
            console.error("Error deleting school", error);
        }
    };

    const handleSubscription = async (schoolId, action, duration) => {
        try {
            await api.patch(`/schools/${schoolId}/subscription`, { action, durationInMonths: duration });
            setIsRenewModalOpen(false);
            fetchSchools();
        } catch (error) {
            console.error("Error updating subscription", error);
        }
    };

    const openRenewModal = (school) => {
        setSelectedSchool(school);
        setIsRenewModalOpen(true);
    };

    const getStatusColor = (status) => {
        if (status === 'ACTIVE') return 'text-green-600 bg-green-100';
        if (status === 'INACTIVE') return 'text-red-600 bg-red-100';
        return 'text-gray-600 bg-gray-100';
    };

    const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manage Schools</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> Add School
                </button>
            </div>

            {/* Stats & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded shadow mb-6 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <SchoolIcon size={24} className="text-blue-500" />
                    <span className="font-semibold text-lg">Total Schools: {schools.length}</span>
                </div>
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search schools..."
                        className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchools.map(school => (
                    <div key={school._id} className="bg-white p-6 rounded shadow border border-gray-100 hover:shadow-lg transition relative group">
                        <button
                            onClick={() => handleDelete(school._id)}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                            title="Delete School"
                        >
                            <Trash2 size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
                                {school.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 leading-tight">{school.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><SchoolIcon size={12} /> {school.address}</p>
                            </div>
                        </div>

                        {/* Subscription Info */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(school.subscriptionStatus || 'ACTIVE')}`}>
                                    {school.subscriptionStatus || 'ACTIVE'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Calendar size={14} /> Expires</span>
                                <span className="font-medium">
                                    {school.subscriptionEndDate ? new Date(school.subscriptionEndDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => openRenewModal(school)}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={14} /> Manage Plan
                            </button>
                            {school.subscriptionStatus !== 'INACTIVE' && (
                                <button
                                    onClick={() => handleSubscription(school._id, 'cancel')}
                                    className="px-3 py-2 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50 transition"
                                    title="Cancel Subscription"
                                >
                                    Stop
                                </button>
                            )}
                            {school.subscriptionStatus === 'INACTIVE' && (
                                <button
                                    onClick={() => openRenewModal(school)}
                                    className="px-3 py-2 border border-green-200 text-green-600 rounded-md text-sm hover:bg-green-50 transition"
                                    title="Start Subscription"
                                >
                                    Start
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Add New School</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-600">School Name</label>
                                    <input
                                        type="text"
                                        className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newSchool.name}
                                        onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-600">Address</label>
                                    <input
                                        type="text"
                                        className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newSchool.address}
                                        onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded border border-blue-100">
                                <h3 className="text-md font-bold text-blue-800 mb-4">Assign School Admin</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="First Name" className="border p-2 rounded" value={newSchool.adminFirstName} onChange={(e) => setNewSchool({ ...newSchool, adminFirstName: e.target.value })} />
                                    <input type="text" placeholder="Last Name" className="border p-2 rounded" value={newSchool.adminLastName} onChange={(e) => setNewSchool({ ...newSchool, adminLastName: e.target.value })} />
                                    <input type="email" placeholder="Email" className="border p-2 rounded" value={newSchool.adminEmail} onChange={(e) => setNewSchool({ ...newSchool, adminEmail: e.target.value })} />
                                    <input type="password" placeholder="Password" className="border p-2 rounded" value={newSchool.adminPassword} onChange={(e) => setNewSchool({ ...newSchool, adminPassword: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Create School</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Renew Modal */}
            {isRenewModalOpen && selectedSchool && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
                        <button
                            onClick={() => setIsRenewModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">
                            {selectedSchool.subscriptionStatus === 'INACTIVE' ? 'Start Subscription' : 'Renew Subscription'}
                        </h2>
                        <p className="text-gray-500 mb-6">Select a duration to {selectedSchool.subscriptionStatus === 'INACTIVE' ? 'enable' : 'extend'} {selectedSchool.name}'s access.</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleSubscription(selectedSchool._id, 'renew', 12)}
                                className="p-4 border-2 border-indigo-100 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition flex justify-between items-center group"
                            >
                                <span className="font-semibold text-gray-700 group-hover:text-indigo-700">1 Year (Best Value)</span>
                                <CheckCircle size={20} className="text-indigo-500 opacity-0 group-hover:opacity-100" />
                            </button>
                            <button
                                onClick={() => handleSubscription(selectedSchool._id, 'renew', 6)}
                                className="p-4 border-2 border-gray-100 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition flex justify-between items-center group"
                            >
                                <span className="font-semibold text-gray-700 group-hover:text-indigo-700">6 Months</span>
                            </button>
                            <button
                                onClick={() => handleSubscription(selectedSchool._id, 'renew', 3)}
                                className="p-4 border-2 border-gray-100 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition flex justify-between items-center group"
                            >
                                <span className="font-semibold text-gray-700 group-hover:text-indigo-700">3 Months</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSchools;
