import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SchoolAdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">School Admin Dashboard</h1>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName}</h2>
                {user?.schoolId && <p className="text-sm text-blue-600 font-bold mb-4">School ID: {user.schoolId}</p>}

                <p className="text-gray-600 mb-4">You can manage users and classes for your school.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div onClick={() => navigate('/school/users')} className="p-4 border rounded hover:shadow-md cursor-pointer transition bg-green-50 border-green-200">
                        <h3 className="font-bold text-lg text-green-900">Manage Users</h3>
                        <p className="text-sm text-gray-500">Add Teachers and Students.</p>
                    </div>
                    <div onClick={() => navigate('/school/classes')} className="p-4 border rounded hover:shadow-md cursor-pointer transition bg-purple-50 border-purple-200">
                        <h3 className="font-bold text-lg text-purple-900">Manage Classes</h3>
                        <p className="text-sm text-gray-500">Create and assign classes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolAdminDashboard;
