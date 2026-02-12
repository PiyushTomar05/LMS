import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, BookOpen, User, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [students, setStudents] = useState([]); // Store all students
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]); // For enrollment
    const [newCourse, setNewCourse] = useState({ name: '', professorId: '', schedule: [] });
    // Local state for adding a slot
    const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '', endTime: '' });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.universityId) {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    await Promise.all([fetchCourses(), fetchProfessors(), fetchStudents()]);
                } catch (error) {
                    console.error("Error loading initial data", error);
                    toast.error("Failed to load dashboard data");
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }
    }, [user]);

    const fetchCourses = async () => {
        try {
            const response = await api.get(`/courses/university/${user.universityId}`);
            setCourses(response.data);
        } catch (error) {
            console.error("Error fetching courses", error);
            toast.error("Failed to refresh courses");
        }
    };

    const fetchProfessors = async () => {
        try {
            const response = await api.get(`/auth/university/${user.universityId}`);
            setProfessors(response.data.filter(u => u.role === 'PROFESSOR'));
        } catch (error) {
            console.error("Error fetching professors", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get(`/auth/university/${user.universityId}`);
            setStudents(response.data.filter(u => u.role === 'STUDENT'));
        } catch (error) {
            console.error("Error fetching students", error);
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', { ...newCourse, universityId: user.universityId });
            setNewCourse({ name: '', professorId: '', schedule: [] });
            setIsModalOpen(false);
            fetchCourses();
            toast.success('Course created successfully');
        } catch (error) {
            console.error("Error creating course", error);
            toast.error('Failed to create course');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses();
            toast.success('Course deleted successfully');
        } catch (error) {
            console.error("Error deleting course", error);
            toast.error('Failed to delete course');
        }
    };

    const handleEnrollClick = (course) => {
        setSelectedCourse(course);
        setSelectedStudents(course.students || []); // Pre-select existing (if we had them, simple array for now)
        setIsEnrollModalOpen(true);
    };

    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/courses/${selectedCourse._id}/enroll`, { studentIds: selectedStudents });
            toast.success('Students enrolled successfully!');
            setIsEnrollModalOpen(false);
            fetchCourses(); // Refresh to see counts if needed
        } catch (error) {
            console.error("Enrollment failed", error);
            toast.error('Enrollment failed');
        }
    };

    const toggleStudentSelection = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    if (isLoading) {
        return <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center text-purple-600 font-bold text-xl">Loading...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700 transition"
                >
                    <Plus size={20} /> Add Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center">
                        <div className="mx-auto h-16 w-16 text-gray-400 mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                        <p className="mt-1 text-sm text-gray-500 mb-4">Get started by creating a new course.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700 transition"
                        >
                            <Plus size={20} /> Create First Course
                        </button>
                    </div>
                )}
                {courses.map(c => (
                    <div key={c._id} className="bg-white p-6 rounded-lg shadow border border-gray-100 hover:shadow-lg transition relative group">
                        <button
                            onClick={() => handleDelete(c._id)}
                            className="absolute top-4 right-4 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            title="Delete Course"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">{c.name}</h3>
                                <p className="text-xs text-gray-400">ID: {c._id.substring(0, 8)}...</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                <User size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Professor</p>
                                <p className="text-sm font-medium text-gray-700">
                                    {c.professorId ? `${c.professorId.firstName} ${c.professorId.lastName}` : <span className="text-red-400 italic">Unassigned</span>}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition" onClick={() => handleEnrollClick(c)}>
                            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-500">
                                <GraduationCap size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Students</p>
                                <p className="text-sm font-medium text-gray-700">
                                    {c.students?.length || 0} Enrolled
                                </p>
                            </div>
                            <Plus size={16} className="text-blue-500" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-600">Course Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mathematics 101"
                                    value={newCourse.name}
                                    onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                    className="border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-600">Assign Professor</label>
                                <select
                                    value={newCourse.professorId}
                                    onChange={e => setNewCourse({ ...newCourse, professorId: e.target.value })}
                                    className="border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">-- Select Professor --</option>
                                    {professors.map(t => (
                                        <option key={t._id} value={t._id}>
                                            {t.firstName} {t.lastName} ({t.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Schedule Editor */}
                            <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded border">
                                <label className="text-sm font-semibold text-gray-600">Weekly Schedule</label>
                                <div className="flex gap-2 items-center">
                                    <select
                                        className="border p-1 rounded text-sm"
                                        value={newSlot.day}
                                        onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}
                                    >
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input
                                        type="time"
                                        className="border p-1 rounded text-sm"
                                        value={newSlot.startTime}
                                        onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                    />
                                    <span>-</span>
                                    <input
                                        type="time"
                                        className="border p-1 rounded text-sm"
                                        value={newSlot.endTime}
                                        onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!newSlot.startTime || !newSlot.endTime) return toast.error("Times are required");
                                            setNewCourse(prev => ({ ...prev, schedule: [...prev.schedule, newSlot] }));
                                            setNewSlot({ day: 'Monday', startTime: '', endTime: '' });
                                        }}
                                        className="bg-green-600 text-white p-1 rounded text-sm hover:bg-green-700"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {/* Added Slots Preview */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newCourse.schedule?.map((slot, idx) => (
                                        <div key={idx} className="bg-white border rounded px-2 py-1 text-xs flex items-center gap-2">
                                            <span className="font-bold">{slot.day.substring(0, 3)}</span>
                                            <span>{slot.startTime}-{slot.endTime}</span>
                                            <button
                                                type="button"
                                                onClick={() => setNewCourse(prev => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== idx) }))}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 transition mt-2">
                                Create Course
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Enrollment Modal */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto relative">
                        <button
                            onClick={() => setIsEnrollModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-bold mb-4">Enroll Students to {selectedCourse?.name}</h2>

                        <div className="flex flex-col gap-2 mb-6">
                            {students.length === 0 ? (
                                <p className="text-gray-500">No students available. Create or import students first.</p>
                            ) : (
                                students.map(s => (
                                    <div key={s._id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => toggleStudentSelection(s._id)}>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(s._id)}
                                            onChange={() => toggleStudentSelection(s._id)}
                                            className="w-5 h-5 text-purple-600"
                                        />
                                        <div>
                                            <p className="font-semibold">{s.firstName} {s.lastName}</p>
                                            <p className="text-xs text-gray-500">{s.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={handleEnrollSubmit}
                            className="bg-green-600 text-white w-full py-2 rounded font-semibold hover:bg-green-700 transition"
                            disabled={selectedStudents.length === 0}
                        >
                            Enroll {selectedStudents.length} Students
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
