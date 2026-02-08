import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UniversityAdminDashboard from './pages/UniversityAdminDashboard';
import ManageUniversities from './pages/ManageUniversities';
import ManageUsers from './pages/ManageUsers';
import TimetableGenerator from './pages/TimetableGenerator';
const ManageCourses = React.lazy(() => import('./pages/ManageCourses'));
const ChangePassword = React.lazy(() => import('./pages/ChangePassword'));
const AcademicManager = React.lazy(() => import('./pages/AcademicManager'));
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import LandingPage from './pages/LandingPage';
// Messages removed
import AcademicCalendar from './pages/AcademicCalendar';

import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

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
        case 'UNIVERSITY_ADMIN':
        case 'SCHOOL_ADMIN': // Handle both legacy and new role name
            return <UniversityAdminDashboard />;
        case 'PROFESSOR':
            return <ProfessorDashboard />;
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
            <Toaster position="top-right" />
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes wrapped in Layout */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<RoleBasedDashboard />} />
                            <Route path="/super-admin/universities" element={<ManageUniversities />} />
                            <Route path="/university/users" element={<ManageUsers />} />
                            <Route path="/university/courses" element={<ManageCourses />} />
                            <Route path="/university/timetable" element={<TimetableGenerator />} />
                            <Route path="/university/academic" element={<AcademicManager />} />
                            <Route path="/academic-calendar" element={<AcademicCalendar />} />
                            <Route path="/users/change-password" element={<ChangePassword />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
