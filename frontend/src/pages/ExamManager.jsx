import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Users, Clock, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ExamManager = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [view, setView] = useState('list'); // list, create, schedule
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'MID_SEM',
        academicYear: '2023-2024',
        startDate: '',
        endDate: '',
        semester: 'Fall'
    });

    useEffect(() => {
        // Fetch Exams (We need an endpoint for this, assuming list endpoint exists or we use direct db query in dev)
        // For now, let's assume we can fetch exams. TODO: Add GET /exams endpoint
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/exams', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Exam Created!');
            setExams([...exams, res.data]);
            setView('list');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create exam');
        }
    };

    const handleGenerateSchedule = async (examId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Hardcoded slots for demo
            const payload = {
                startDate: formData.startDate || new Date().toISOString(),
                endDate: formData.endDate || new Date().toISOString(),
                slotsPerDay: ["09:00", "14:00"]
            };

            const res = await axios.post(`http://localhost:5000/exams/${examId}/generate`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(res.data.message);
            fetchSchedule(examId);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Scheduling Failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async (examId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/exams/${examId}/schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchedule(res.data);
            setSelectedExam(examId);
            setView('schedule');
        } catch (error) {
            toast.error('Failed to fetch schedule');
        }
    };

    const handleAssignInvigilators = async (examId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/exams/${examId}/invigilators`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(res.data.message);
            fetchSchedule(examId);
        } catch (error) {
            toast.error('Failed to assign invigilators');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Exam Management</h1>
                {view === 'list' && (
                    <button onClick={() => setView('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <Plus size={20} /> Create New Exam
                    </button>
                )}
                {view !== 'list' && (
                    <button onClick={() => setView('list')} className="text-gray-600 hover:text-gray-900">
                        Back to List
                    </button>
                )}
            </div>

            {view === 'create' && (
                <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Create New Exam Cycle</h2>
                    <form onSubmit={handleCreateExam} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                                <input name="name" onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="e.g. Fall Mid-Sem 2024" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select name="type" onChange={handleChange} className="w-full p-2 border rounded mt-1">
                                    <option value="MID_SEM">Mid Semester</option>
                                    <option value="END_SEM">End Semester</option>
                                    <option value="BACKLOG">Backlog</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input type="date" name="startDate" onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" name="endDate" onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create Exam</button>
                    </form>
                </div>
            )}

            {view === 'schedule' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold">Timetable Preview</h2>
                        <div className="flex gap-2">
                            <button onClick={() => handleGenerateSchedule(selectedExam)} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                {loading ? 'Scheduling...' : <><Calendar size={18} /> Re-Generate Schedule</>}
                            </button>
                            <button onClick={() => handleAssignInvigilators(selectedExam)} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                <Users size={18} /> Auto-Assign Invigilators
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Course</th>
                                    <th className="p-4">Room</th>
                                    <th className="p-4">Invigilator</th>
                                    <th className="p-4">Students</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedule.map((slot) => (
                                    <tr key={slot._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{new Date(slot.date).toLocaleDateString()}</td>
                                        <td className="p-4 flex items-center gap-2 text-gray-600">
                                            <Clock size={16} /> {slot.startTime} - {slot.endTime}
                                        </td>
                                        <td className="p-4 font-semibold text-blue-600">
                                            {slot.courseId?.name}
                                            <span className="text-xs text-gray-500 block">{slot.courseId?.code}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                <MapPin size={12} /> {slot.classroomId?.name}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-700">
                                            {slot.invigilatorId ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-green-500" />
                                                    {slot.invigilatorId.firstName} {slot.invigilatorId.lastName}
                                                </div>
                                            ) : (
                                                <span className="text-red-500 text-sm">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600">{slot.studentCount}</td>
                                    </tr>
                                ))}
                                {schedule.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            No schedule generated yet. Click "Generate Schedule" to start.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Temporary Placeholder for List View since we don't have GET /exams yet */}
            {view === 'list' && (
                <div className="text-center py-20 bg-white rounded-xl shadow">
                    <h2 className="text-2xl text-gray-400 mb-4">No Exams Found</h2>
                    <p className="text-gray-500 mb-6">Create your first exam cycle to get started.</p>
                    <button onClick={() => setView('create')} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition">
                        Create Exam Cycle
                    </button>

                    {/* Dev Only: Shortcuts to view schedules of just-created exams in this session */}
                    {exams.length > 0 && (
                        <div className="mt-8 text-left max-w-md mx-auto">
                            <h3 className="font-bold text-gray-700 mb-2">Recent (Session):</h3>
                            <ul className="space-y-2">
                                {exams.map(e => (
                                    <li key={e._id} onClick={() => { fetchSchedule(e._id); setSelectedExam(e._id); }} className="p-3 border rounded cursor-pointer hover:bg-blue-50 flex justify-between">
                                        <span>{e.name}</span>
                                        <span className="text-sm text-blue-500">View Schedule &rarr;</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExamManager;
