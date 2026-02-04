import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import ManageSchools from './pages/ManageSchools';
import ManageUsers from './pages/ManageUsers';
import ManageClasses from './pages/ManageClasses';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const RoleBasedDashboard = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'SUPER_ADMIN':
            return <SuperAdminDashboard />;
        case 'SCHOOL_ADMIN':
            return <SchoolAdminDashboard />;
        case 'TEACHER':
            return <TeacherDashboard />;
        case 'STUDENT':
            return <StudentDashboard />;
        default:
            return (
                <div className="p-8">
                    <h1 className="text-2xl">Welcome {user.firstName}</h1>
                    <p>Unknown Role: {user.role}</p>
                </div>
            );
    }
};

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes wrapped in Layout */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/" element={<RoleBasedDashboard />} />
                            <Route path="/super-admin/schools" element={<ManageSchools />} />
                            <Route path="/school/users" element={<ManageUsers />} />
                            <Route path="/school/classes" element={<ManageClasses />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
