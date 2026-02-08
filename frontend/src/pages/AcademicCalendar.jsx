import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicCalendar = () => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'Holiday',
        startDate: '',
        endDate: '',
        description: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'UNIVERSITY_ADMIN';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get(`/calendar?universityId=${user.universityId}`);
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/calendar', { ...newEvent, universityId: user.universityId });
            toast.success('Event added successfully');
            setIsModalOpen(false);
            fetchEvents();
            setNewEvent({ title: '', type: 'Holiday', startDate: '', endDate: '', description: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/calendar/${id}`);
            toast.success('Event deleted');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    // Calendar Helper Functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 = Sunday
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 border border-gray-100"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = events.filter(ev => {
                const start = new Date(ev.startDate).toISOString().split('T')[0];
                const end = new Date(ev.endDate).toISOString().split('T')[0];
                return dateStr >= start && dateStr <= end;
            });

            days.push(
                <div key={d} className="h-24 bg-white border border-gray-100 p-2 overflow-y-auto relative hover:bg-gray-50 transition">
                    <span className="text-sm font-bold text-gray-500">{d}</span>
                    <div className="mt-1 space-y-1">
                        {dayEvents.map(ev => (
                            <div
                                key={ev._id}
                                className={`text-[10px] p-1 rounded font-semibold truncate cursor-pointer group relative
                                    ${ev.type === 'Holiday' ? 'bg-red-100 text-red-600' :
                                        ev.type === 'Exam' ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-100 text-blue-600'}`}
                            >
                                {ev.title}
                                {isAdmin && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev._id); }}
                                        className="absolute right-1 top-0.5 hidden group-hover:block text-red-500 bg-white rounded-full px-1"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Academic Calendar</h1>
                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={20} /> Add Event
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft />
                    </button>
                    <h2 className="text-xl font-bold text-gray-700">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-2 text-center text-sm font-bold text-gray-500">{d}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7">
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
                        <h2 className="text-xl font-bold mb-4">Add Academic Event</h2>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <input
                                placeholder="Event Title"
                                className="w-full p-2 border rounded"
                                value={newEvent.title}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                required
                            />
                            <select
                                className="w-full p-2 border rounded"
                                value={newEvent.type}
                                onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                            >
                                <option value="Holiday">Holiday</option>
                                <option value="Exam">Exam</option>
                                <option value="Semester Start">Semester Start</option>
                                <option value="Semester End">Semester End</option>
                                <option value="Event">Other Event</option>
                            </select>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-500">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded"
                                        value={newEvent.startDate}
                                        onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-500">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded"
                                        value={newEvent.endDate}
                                        onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <textarea
                                placeholder="Description (Optional)"
                                className="w-full p-2 border rounded"
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">Save Event</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicCalendar;
