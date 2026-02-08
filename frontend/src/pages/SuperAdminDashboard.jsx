import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { School, Users } from 'lucide-react';

const SuperAdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ schools: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/universities');
            setStats({ universities: response.data.length });
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white mb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
                <p className="opacity-90">Manage your universities and administrators from one central hub.</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <School size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Universities</p>
                        <h3 className="text-2xl font-bold">{stats.universities}</h3>
                    </div>
                </div>
                {/* Placeholder for future stats */}
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4 opacity-50">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Users</p>
                        <h3 className="text-2xl font-bold">--</h3>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => navigate('/super-admin/universities')} className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition border-l-4 border-blue-500 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition">Manage Universities</h3>
                            <p className="text-sm text-gray-500 mt-1">Add, edit, or remove universities.</p>
                        </div>
                        <School className="text-gray-300 group-hover:text-blue-500 transition" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
