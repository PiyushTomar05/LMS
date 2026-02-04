import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, BookOpen, User, GraduationCap } from 'lucide-react';

const ManageClasses = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]); // Store all students
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]); // For enrollment
    const [newClass, setNewClass] = useState({ name: '', teacherId: '' });

    useEffect(() => {
        if (user?.schoolId) {
            fetchClasses();
            fetchTeachers();
            fetchStudents();
        }
    }, [user]);

    const fetchClasses = async () => {
        try {
            const response = await api.get(`/classes/school/${user.schoolId}`);
            setClasses(response.data);
        } catch (error) {
            console.error("Error fetching classes", error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get(`/auth/school/${user.schoolId}`);
            setTeachers(response.data.filter(u => u.role === 'TEACHER'));
        } catch (error) {
            console.error("Error fetching teachers", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get(`/auth/school/${user.schoolId}`);
            setStudents(response.data.filter(u => u.role === 'STUDENT'));
        } catch (error) {
            console.error("Error fetching students", error);
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', { ...newClass, schoolId: user.schoolId });
            setNewClass({ name: '', teacherId: '' });
            setIsModalOpen(false);
            fetchClasses();
        } catch (error) {
            console.error("Error creating class", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this class?")) return;
        try {
            await api.delete(`/classes/${id}`);
            fetchClasses();
        } catch (error) {
            console.error("Error deleting class", error);
        }
    };

    const handleEnrollClick = (cls) => {
        setSelectedClass(cls);
        setSelectedStudents(cls.students || []); // Pre-select existing (if we had them, simple array for now)
        setIsEnrollModalOpen(true);
    };

    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/classes/${selectedClass._id}/enroll`, { studentIds: selectedStudents });
            alert('Students enrolled successfully!');
            setIsEnrollModalOpen(false);
            fetchClasses(); // Refresh to see counts if needed
        } catch (error) {
            console.error("Enrollment failed", error);
        }
    };

    const toggleStudentSelection = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manage Classes</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700 transition"
                >
                    <Plus size={20} /> Add Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(c => (
                    <div key={c._id} className="bg-white p-6 rounded-lg shadow border border-gray-100 hover:shadow-lg transition relative group">
                        <button
                            onClick={() => handleDelete(c._id)}
                            className="absolute top-4 right-4 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            title="Delete Class"
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
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Teacher</p>
                                <p className="text-sm font-medium text-gray-700">
                                    {c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : <span className="text-red-400 italic">Unassigned</span>}
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
                        <h2 className="text-2xl font-bold mb-6">Create New Class</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-600">Class Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mathematics 101"
                                    value={newClass.name}
                                    onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                    className="border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-600">Assign Teacher</label>
                                <select
                                    value={newClass.teacherId}
                                    onChange={e => setNewClass({ ...newClass, teacherId: e.target.value })}
                                    className="border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">-- Select Teacher --</option>
                                    {teachers.map(t => (
                                        <option key={t._id} value={t._id}>
                                            {t.firstName} {t.lastName} ({t.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 transition mt-2">
                                Create Class
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
                        <h2 className="text-xl font-bold mb-4">Enroll Students to {selectedClass?.name}</h2>

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

export default ManageClasses;
