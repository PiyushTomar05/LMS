import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TimetableGenerator = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newClassroom, setNewClassroom] = useState({ name: '', capacity: 30, type: 'Lecture Hall' });

    // Filter State
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedProfessor, setSelectedProfessor] = useState('All');
    const [showWeekends, setShowWeekends] = useState(true);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualEntry, setManualEntry] = useState({ courseId: '', day: 'Saturday', startTime: '09:00', roomId: '' });

    // User State
    const [currentUser, setCurrentUser] = useState(null);

    // Derived Data for Filters
    const uniqueSections = ['All', ...new Set(timetable.map(c => c.section))].sort();
    const uniqueProfessors = ['All', ...new Set(timetable.map(c => c.professorId?.lastName).filter(Boolean))].sort();

    // Fetch Initial Data
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchClassrooms(user);
        fetchTimetable(user);
    }, []);

    const fetchClassrooms = async (user) => {
        try {
            if (user?.universityId) {
                const { data } = await api.get(`/timetable/classrooms/all?universityId=${user.universityId}`);
                setClassrooms(data);
            }
        } catch (error) {
            console.error("Failed to fetch classrooms", error);
        }
    };

    const fetchTimetable = async (user) => {
        try {
            if (user?.universityId) {
                const { data } = await api.get(`/timetable/${user.universityId}`);
                setTimetable(data);
            }
        } catch (error) {
            console.error("Failed to fetch timetable", error);
        }
    };

    const handleAddClassroom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/timetable/classrooms', { ...newClassroom, universityId: currentUser.universityId });
            setNewClassroom({ name: '', capacity: 30, type: 'Lecture Hall' });
            fetchClassrooms(currentUser);
            toast.success("Classroom added!");
        } catch (error) {
            toast.error("Failed to add classroom");
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post('/timetable/generate', { universityId: currentUser.universityId });
            toast.success(res.data.message || "Timetable generated!");
            fetchTimetable(currentUser);
        } catch (error) {
            toast.error("Generation failed: " + (error.response?.data?.message || error.message));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleManualSchedule = async (e) => {
        e.preventDefault();
        try {
            const course = timetable.find(c => c._id === manualEntry.courseId);
            if (!course) return toast.error("Please select a course");

            const newSlot = {
                day: manualEntry.day,
                startTime: manualEntry.startTime,
                endTime: `${parseInt(manualEntry.startTime.split(':')[0]) + 1}:00`.padStart(5, '0')
            };

            const updatedSchedule = [...course.schedule, newSlot];

            // FIXED: Changed to PATCH
            await api.patch('/timetable/update', {
                courseId: manualEntry.courseId,
                schedule: updatedSchedule
            });

            toast.success("Class scheduled manually!");
            setIsManualModalOpen(false);
            fetchTimetable(currentUser);
        } catch (error) {
            toast.error("Failed to schedule: " + (error.response?.data?.message || error.message));
        }
    };

    // Helper to render grid
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    const days = showWeekends
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const getSlotContent = (day, time) => {
        const slotCourses = [];
        timetable.forEach(course => {
            if (selectedSection !== 'All' && course.section !== selectedSection) return;
            if (selectedProfessor !== 'All' && course.professorId?.lastName !== selectedProfessor) return;

            const match = course.schedule.find(s => s.day === day && s.startTime === time);
            if (match) {
                slotCourses.push(course);
            }
        });

        if (slotCourses.length === 0) return null;

        return slotCourses.map(c => (
            <div key={c._id} className="group relative text-xs bg-white p-2 rounded-lg mb-2 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <div className="font-bold flex justify-between items-center text-slate-700">
                    <span className="truncate">{c.name}</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">{c.section}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {c.professorId?.firstName} {c.professorId?.lastName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 ml-2.5">
                    {c.classroomId?.name}
                </div>
            </div>
        ));
    };

    const isProfessor = currentUser?.role === 'PROFESSOR';

    // Filter courses for Manual Entry dropdown
    const availableCoursesForManual = isProfessor
        ? timetable.filter(c => c.professorId?._id === currentUser._id)
        : timetable;

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Timetable Management</h1>
                    <p className="text-slate-500 mt-1">Manage schedules, classrooms, and makeup classes</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 px-3">
                        <input
                            type="checkbox"
                            id="weekends"
                            checked={showWeekends}
                            onChange={e => setShowWeekends(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="weekends" className="text-sm font-medium text-slate-600 cursor-pointer select-none">Show Weekends</label>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-indigo-200 shadow-lg transform active:scale-95"
                    >
                        <Calendar size={16} /> Schedule Class
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar: Controls (Hidden for Professors unless we want them to see rooms) */}
                {!isProfessor && (
                    <div className="lg:col-span-1 space-y-6">
                        {/* Actions Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Control Panel</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || classrooms.length === 0}
                                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all shadow-lg ${isGenerating || classrooms.length === 0 ? 'bg-slate-400 shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-200'
                                        }`}
                                >
                                    <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} />
                                    {isGenerating ? 'Generating...' : 'Auto-Generate'}
                                </button>

                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Are you sure? This will wipe the current schedule.")) return;
                                        try {
                                            await api.post('/timetable/reset', { universityId: currentUser.universityId });
                                            toast.success("Timetable reset.");
                                            fetchTimetable(currentUser);
                                        } catch (e) { toast.error("Reset failed"); }
                                    }}
                                    className="w-full py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition text-sm font-semibold"
                                >
                                    Reset All Schedules
                                </button>
                            </div>
                        </div>

                        {/* Add Room Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Plus size={16} className="text-blue-500" /> Manage Classrooms
                            </h3>
                            <form onSubmit={handleAddClassroom} className="space-y-3">
                                <input
                                    placeholder="Room Name (e.g. 101)"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={newClassroom.name}
                                    onChange={e => setNewClassroom({ ...newClassroom, name: e.target.value })}
                                    required
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Cap"
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={newClassroom.capacity}
                                        onChange={e => setNewClassroom({ ...newClassroom, capacity: e.target.value })}
                                        required
                                    />
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={newClassroom.type}
                                        onChange={e => setNewClassroom({ ...newClassroom, type: e.target.value })}
                                    >
                                        <option value="Lecture Hall">Lecture Hall</option>
                                        <option value="Lab">Lab</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-xl hover:bg-slate-900 transition text-sm font-semibold shadow-lg shadow-slate-200">Add Room</button>
                            </form>

                            {/* List Rooms */}
                            <div className="mt-6">
                                <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">Existing Rooms</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {classrooms.map(r => (
                                        <div key={r._id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition">
                                            <span className="font-medium text-slate-700">{r.name}</span>
                                            <span className="text-[10px] bg-white px-2 py-1 rounded border border-slate-100 text-slate-500">{r.type} • {r.capacity}</span>
                                        </div>
                                    ))}
                                    {classrooms.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">No rooms added yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main: Timetable Grid */}
                <div className={`${isProfessor ? 'col-span-4' : 'lg:col-span-3'} bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Calendar size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800">Weekly Schedule</h3>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3">
                            <select
                                className="p-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                            >
                                <option value="All">All Sections</option>
                                {uniqueSections.filter(s => s !== 'All').map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>

                            <select
                                className="p-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                value={selectedProfessor}
                                onChange={e => setSelectedProfessor(e.target.value)}
                            >
                                <option value="All">All Professors</option>
                                {uniqueProfessors.filter(p => p !== 'All').map(p => <option key={p} value={p}>Prof. {p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-4">
                        {/* Header Row */}
                        <div className="grid grid-cols-9 gap-0 min-w-[1000px]">
                            <div className="p-4 bg-slate-50/80 font-bold text-slate-500 text-xs uppercase tracking-wider text-center border-b border-r border-slate-100 rounded-tl-xl">Time / Day</div>
                            {times.map(t => (
                                <div key={t} className="p-4 bg-slate-50/80 font-bold text-slate-500 text-xs text-center border-b border-slate-100 last:rounded-tr-xl">
                                    {t}
                                </div>
                            ))}

                            {/* Data Rows */}
                            {days.map((day, idx) => (
                                <React.Fragment key={day}>
                                    <div className={`p-4 font-bold text-slate-700 text-sm border-b border-r border-slate-100 flex items-center justify-center ${day === 'Saturday' || day === 'Sunday' ? 'bg-orange-50/50 text-orange-700' : 'bg-white'} ${idx === days.length - 1 ? 'rounded-bl-xl' : ''}`}>
                                        {day.substring(0, 3)}
                                    </div>
                                    {times.map((time, tIdx) => (
                                        <div key={`${day}-${time}`} className={`p-1 border-b border-r border-slate-100 border-dashed h-32 overflow-y-auto transition-colors hover:bg-slate-50/50 ${idx === days.length - 1 && tIdx === times.length - 1 ? 'rounded-br-xl' : ''}`}>
                                            {getSlotContent(day, time)}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Formatting Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg relative shadow-2xl transform transition-all scale-100">
                        <button
                            onClick={() => setIsManualModalOpen(false)}
                            className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition"
                        >✕</button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-800">Schedule Class</h2>
                            <p className="text-slate-500 text-sm">Manually add a session (Makeup or Extra)</p>
                        </div>

                        <form onSubmit={handleManualSchedule} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Course</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={manualEntry.courseId}
                                    onChange={e => setManualEntry({ ...manualEntry, courseId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Course --</option>
                                    {/* Filtered list based on role */}
                                    {availableCoursesForManual.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.section}) - {c.professorId?.lastName}</option>
                                    ))}
                                </select>
                                {isProfessor && availableCoursesForManual.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">No courses assigned to you found.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Day</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={manualEntry.day}
                                        onChange={e => setManualEntry({ ...manualEntry, day: e.target.value })}
                                    >
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">Saturday</option>
                                        <option value="Sunday">Sunday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={manualEntry.startTime}
                                        onChange={e => setManualEntry({ ...manualEntry, startTime: e.target.value })}
                                    >
                                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-xs flex gap-2 items-start">
                                <span className="text-lg">⚠️</span>
                                <p>This manual override bypasses standard clash detection. Please double-check room and professor availability before saving.</p>
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 transition transform active:scale-[0.98]">
                                Confirm Schedule
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableGenerator;
