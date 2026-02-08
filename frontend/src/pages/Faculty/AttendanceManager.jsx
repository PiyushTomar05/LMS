import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Calendar, UserCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceManager = () => {
    // State
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [attendanceType, setAttendanceType] = useState('Lecture');

    // Attendance Map: { studentId: 'PRESENT' | 'ABSENT' | 'LATE' }
    const [attendanceMap, setAttendanceMap] = useState({});

    // Fetch Assigned Courses on Mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                // Assuming we have an endpoint to get courses for the logged-in teacher
                // If not, we might need to filter from all courses or add a specific endpoint. 
                // For now, let's try getting all and filtering (less efficient but works for small app)
                // Better approach: /courses/my-courses or similar
                const { data } = await api.get(`/courses?universityId=${user.universityId}`);

                // Filter where current user is the professor
                const myCourses = data.filter(c => c.professor?._id === user._id || c.professor === user._id);
                setCourses(myCourses);
            } catch (error) {
                toast.error("Failed to load courses");
            }
        };
        fetchCourses();
    }, []);

    // Fetch Students when Course Changes
    useEffect(() => {
        if (!selectedCourse) return;

        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Get students for this course. 
                // Ideally backend should have /courses/:id/students
                // For now, we reuse the course details or similar?
                // Let's assume GET /courses/:id returns populated students/sections
                // OR we can fetch users and filter by section if needed.
                // BEST PATH: Assume backend /courses/:id gives us enrolled student info or we query based on section.

                // Let's implement a clean way: Get Course -> Get Section -> Get Students in Section 
                const { data: course } = await api.get(`/courses/${selectedCourse}`);

                // Now get students in this section
                // Backend endpoint: /users?role=STUDENT&section=...
                const { data: allStudents } = await api.get(`/users?role=STUDENT&universityId=${course.universityId}`);
                const enrolled = allStudents.filter(s => s.section === course.section);

                setStudents(enrolled);

                // Initialize all as PRESENT default
                const initialMap = {};
                enrolled.forEach(s => initialMap[s._id] = 'PRESENT');
                setAttendanceMap(initialMap);

            } catch (error) {
                console.error(error);
                toast.error("Failed to load students");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedCourse]);

    const handleMark = (studentId, status) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmit = async () => {
        if (!selectedCourse || !date) return toast.error("Please select course and date");

        setLoading(true);
        try {
            const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await api.post('/attendance/mark', {
                courseId: selectedCourse,
                date,
                records,
                type: attendanceType
            });

            toast.success("Attendance marked successfully!");
            // Optional: reset or redirect
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mark attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Mark Attendance</h1>
            <p className="text-slate-500 mb-8">Record daily attendance for your classes.</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Course</label>
                        <select
                            className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">-- Choose Course --</option>
                            {courses.map(c => (
                                <option key={c._id} value={c._id}>{c.name} (Sec {c.section})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
                        <input
                            type="date"
                            className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
                        <select
                            className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={attendanceType}
                            onChange={(e) => setAttendanceType(e.target.value)}
                        >
                            <option value="Lecture">Lecture</option>
                            <option value="Lab">Lab</option>
                            <option value="Tutorial">Tutorial</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedCourse}
                            className={`w-full p-3 rounded-lg font-bold text-white transition ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                        >
                            {loading ? 'Processing...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>
            </div>

            {selectedCourse && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <UserCheck size={18} /> Student List
                        </h3>
                        <div className="text-sm text-slate-500">
                            Total: {students.length} | Present: {Object.values(attendanceMap).filter(v => v === 'PRESENT').length}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase bg-slate-50">Student Name</th>
                                    <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase bg-slate-50">Roll/URN</th>
                                    <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase bg-slate-50 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                                        <td className="p-4 font-medium text-slate-700">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 font-mono">
                                            {student.urn || 'N/A'}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleMark(student._id, status)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition border ${attendanceMap[student._id] === status
                                                        ? status === 'PRESENT' ? 'bg-green-100 text-green-700 border-green-200'
                                                            : status === 'ABSENT' ? 'bg-red-100 text-red-700 border-red-200'
                                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-400 italic">
                                            No students found in this section.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManager;
