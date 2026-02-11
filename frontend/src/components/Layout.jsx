import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    School,
    BookOpen,
    LogOut,
    Menu,
    X,
    GraduationCap,
    ChevronDown,
    Bell,
    Lock,
    LayoutDashboard,
    Users,
    Calendar,
    Layers,
    FileText,
    CreditCard
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        switch (user?.role) {
            case 'SUPER_ADMIN':
                return [
                    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                    { label: 'Manage Universities', path: '/super-admin/universities', icon: School },
                    { label: 'Security', path: '/users/change-password', icon: Lock },
                ];
            case 'UNIVERSITY_ADMIN':
            case 'SCHOOL_ADMIN':
                return [
                    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                    { label: 'Manage Users', path: '/university/users', icon: Users },
                    { label: 'Manage Courses', path: '/university/courses', icon: BookOpen },
                    { label: 'Academic Core', path: '/university/academic', icon: Layers },
                    { label: 'Exams', path: '/university/exams', icon: FileText },
                    { label: 'fees', path: '/university/fees', icon: CreditCard },
                    { label: 'Timetable', path: '/university/timetable', icon: Calendar },
                    { label: 'Academic Calendar', path: '/academic-calendar', icon: Calendar },
                    { label: 'Security', path: '/users/change-password', icon: Lock },
                ];
            case 'PROFESSOR':
                return [
                    { label: 'My Courses', path: '/dashboard', icon: BookOpen },
                    { label: 'Security', path: '/users/change-password', icon: Lock },
                ];
            case 'STUDENT':
                return [
                    { label: 'My Enrollment', path: '/dashboard', icon: GraduationCap },
                    { label: 'My Fees', path: '/student/fees', icon: CreditCard },
                    { label: 'Security', path: '/users/change-password', icon: Lock },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 border-r border-slate-800 flex flex-col shadow-xl lg:shadow-none`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
                        <div className="bg-primary-600 p-1.5 rounded-lg">
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <span>EduManager</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)} // Close on mobile click
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm ${isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-all group font-medium text-sm"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 lg:ml-64`}>
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-primary-600 lg:hidden">
                            <Menu size={24} />
                        </button>
                        {/* Breadcrumb or Page Title could go here */}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="text-slate-400 hover:text-slate-600 relative transition-colors"
                            >
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                        <p className="text-sm font-bold text-gray-800">Notifications</p>
                                        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">Mark all read</button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="px-4 py-3 hover:bg-gray-50 bg-blue-50/50 border-b border-gray-50 cursor-pointer transition-colors">
                                            <p className="text-xs font-bold text-gray-800 mb-1">New Assignment Posted</p>
                                            <p className="text-xs text-slate-500">Professor Smith posted "Midterm Project" in Computer Science.</p>
                                            <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors">
                                            <p className="text-xs font-bold text-gray-800 mb-1">Fee Payment Successful</p>
                                            <p className="text-xs text-slate-500">Your payment for Semester 3 was confirmed.</p>
                                            <p className="text-[10px] text-slate-400 mt-1">1 day ago</p>
                                        </div>
                                        <div className="px-4 py-2 text-center text-xs text-slate-400 italic">
                                            View all notifications
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 py-1.5 px-2 rounded-full hover:bg-gray-100 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm border border-primary-200">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-slate-700 leading-none">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
                                </div>
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <p className="text-sm font-black text-gray-800">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] uppercase font-bold rounded-full tracking-wider">
                                            {user?.role?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate('/users/change-password');
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 flex items-center gap-3 transition-colors"
                                        >
                                            <Lock size={16} /> Change Password
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-100 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
