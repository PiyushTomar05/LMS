import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const [classes, setClasses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/classes/teacher/my-classes');
                setClasses(response.data);
            } catch (error) {
                console.error("Error fetching classes", error);
            }
        };
        fetchClasses();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-slate-800">My Classes</h1>

            {classes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="inline-flex p-4 rounded-full bg-slate-50 mb-4 text-slate-400">
                        <BookOpen size={32} />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No classes assigned yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(c => (
                        <div key={c._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{c.name}</h3>
                                    <p className="text-xs text-gray-400">ID: {c._id.substring(0, 8)}</p>
                                </div>
                            </div>
                            <div className="border-t pt-4 flex items-center gap-2 text-gray-600">
                                <Users size={18} />
                                <span className="font-medium">{c.students?.length || 0} Students Enrolled</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
