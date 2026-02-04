import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    School,
    BookOpen,
    LogOut,
    Menu,
    X,
    GraduationCap,
    ChevronDown,
    Bell
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        switch (user?.role) {
            case 'SUPER_ADMIN':
                return [
                    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
                    { label: 'Manage Schools', path: '/super-admin/schools', icon: School },
                ];
            case 'SCHOOL_ADMIN':
                return [
                    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
                    { label: 'Manage Users', path: '/school/users', icon: Users },
                    { label: 'Manage Classes', path: '/school/classes', icon: BookOpen },
                ];
            case 'TEACHER':
                return [
                    { label: 'My Classes', path: '/', icon: BookOpen },
                ];
            case 'STUDENT':
                return [
                    { label: 'My Enrollment', path: '/', icon: GraduationCap },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0 shadow-lg lg:shadow-none`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
                        <GraduationCap size={28} />
                        <span>EduManager</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-slate-700 lg:hidden">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="text-slate-400 hover:text-slate-600 relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-3 rounded-full transition-colors border border-transparent hover:border-slate-200"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    {user?.firstName[0]}{user?.lastName[0]}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-slate-700 leading-none">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
                                </div>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
