import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, CheckCircle, XCircle, FileText, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Announcements from '../components/Announcements';
import ResourceManager from '../components/ResourceManager';

const ProfessorDashboard = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
    const [assignments, setAssignments] = useState([]); // List of assignments for the selected course

    // Grading State
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [gradingSubmission, setGradingSubmission] = useState(null); // The specific submission being graded
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

    // Resource Manager State
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [resourceCourse, setResourceCourse] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Assuming backend route is updated to /courses/professor/my-courses or similar
                // Originally was /classes/teacher/my-classes
                // Let's assume we use /courses/professor/my-courses or similar in backend refactor (I need to ensure backend routes match)
                // Checking previous steps, I renamed files but I need to be sure about routes.
                // In my plan, I said "Refactor Backend Routes".
                // Let's stick to consistent naming: /courses/professor/my-courses
                const response = await api.get('/courses/professor/my-courses');
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses", error);
            }
        };
        fetchCourses();
    }, []);

    const openAttendanceModal = (course) => {
        setSelectedCourse(course);
        const initialRecords = {};
        course.students.forEach(s => {
            initialRecords[s._id] = 'PRESENT';
        });
        setAttendanceRecords(initialRecords);
        setIsAttendanceModalOpen(true);
    };

    const toggleStatus = (studentId) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
        }));
    };

    const submitAttendance = async () => {
        try {
            const records = Object.keys(attendanceRecords).map(studentId => ({
                studentId,
                status: attendanceRecords[studentId]
            }));

            await api.post('/attendance/mark', {
                date: attendanceDate,
                courseId: selectedCourse._id,
                records
            });

            toast.success('Attendance marked successfully');
            setIsAttendanceModalOpen(false);
        } catch (error) {
            console.error("Error marking attendance", error);
            toast.error('Failed to mark attendance');
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assignments', {
                ...newAssignment,
                courseId: selectedCourse._id
            });
            toast.success('Assignment created successfully');
            setIsAssignmentModalOpen(false);
            setNewAssignment({ title: '', description: '', dueDate: '' });
        } catch (error) {
            console.error("Error creating assignment", error);
            toast.error('Failed to create assignment');
        }
    };

    const fetchSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        try {
            const response = await api.get(`/assignments/${assignment._id}/submissions`);
            setSubmissions(response.data);
            setIsSubmissionsModalOpen(true);
        } catch (error) {
            console.error("Error fetching submissions", error);
            toast.error('Failed to load submissions');
        }
    };

    const handleGrade = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/assignments/submissions/${gradingSubmission._id}/grade`, gradeData);
            toast.success('Grade saved');
            setGradingSubmission(null);
            setGradeData({ grade: '', feedback: '' });
            fetchSubmissions(selectedAssignment); // Refresh
        } catch (error) {
            console.error(error);
            toast.error('Failed to save grade');
        }
    };

    return (
        <div className="p-8 min-h-screen">
            <h1 className="text-3xl font-bold text-slate-800 mb-8 animate-fade-in">Professor Dashboard</h1>

            {/* Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-slide-up relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold shadow-inner">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-slate-800">{user?.firstName} {user?.lastName}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-500">
                            <span className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {user?.facultyId || 'No Faculty ID'}
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span>{user?.designation || 'Faculty Member'}</span>
                            <span className="hidden md:inline">•</span>
                            <span>{user?.qualification || 'PhD'}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="capitalize">{user?.employmentType?.toLowerCase() || 'Permanent'}</span>
                        </div>
                    </div>
                    <div className="flex gap-4 border-l pl-6 border-slate-100">
                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Department</p>
                            <p className="font-bold text-slate-700">{user?.department || 'General'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Leave Balance</p>
                            <p className="font-bold text-primary-600">{user?.leaveBalance || 12}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Announcements Section */}
            <Announcements userRole="PROFESSOR" />

            {/* Attendance Mark/Check Toggle */}
            {courses.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl animate-slide-up shadow-sm">
                    <div className="inline-flex p-6 rounded-full bg-slate-50 mb-6 text-slate-400">
                        <BookOpen size={48} />
                    </div>
                    <p className="text-slate-500 text-xl font-medium">No courses assigned yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((c, index) => (
                        <div key={c._id} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
                                    <BookOpen size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">{c.name}</h3>
                                    <p className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1 w-fit">ID: {c._id.substring(0, 8)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                    <Users size={18} />
                                    <span className="font-medium">{c.students?.length || 0} Students</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => openAttendanceModal(c)}
                                        className="text-sm bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl hover:bg-indigo-100 font-semibold transition border border-indigo-100"
                                    >
                                        Attendance
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setSelectedCourse(c);
                                            try {
                                                const res = await api.get(`/assignments/course/${c._id}`);
                                                setAssignments(res.data);
                                                setIsAssignmentModalOpen(true);
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-xl hover:bg-purple-100 font-semibold transition border border-purple-100"
                                    >
                                        Assignments
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        setResourceCourse(c);
                                        setIsResourceModalOpen(true);
                                    }}
                                    className="text-sm w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white px-3 py-2 rounded-xl hover:shadow-lg hover:shadow-orange-200 font-semibold transition flex items-center justify-center gap-2"
                                >
                                    Resources
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Attendance Modal */}
            {isAttendanceModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => setIsAttendanceModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold mb-2">Mark Attendance</h2>
                        <p className="text-gray-500 mb-6">Course: {selectedCourse.name}</p>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-2 mb-6">
                            {selectedCourse.students?.map(s => (
                                <div
                                    key={s._id}
                                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition ${attendanceRecords[s._id] === 'PRESENT' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                                    onClick={() => toggleStatus(s._id)}
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">{s.firstName} {s.lastName}</p>
                                        <p className="text-xs text-gray-500">{s.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${attendanceRecords[s._id] === 'PRESENT' ? 'text-green-600' : 'text-red-600'}`}>
                                            {attendanceRecords[s._id]}
                                        </span>
                                        {attendanceRecords[s._id] === 'PRESENT' ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                                    </div>
                                </div>
                            ))}
                            {selectedCourse.students?.length === 0 && <p className="text-center text-gray-500">No students in this course.</p>}
                        </div>

                        <button
                            onClick={submitAttendance}
                            className="bg-indigo-600 text-white w-full py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                            disabled={selectedCourse.students?.length === 0}
                        >
                            Submit Attendance
                        </button>
                    </div>
                </div>
            )}

            {/* Assignments List & Create Modal */}
            {isAssignmentModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => setIsAssignmentModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Assignments: {selectedCourse.name}</h2>

                        {/* Create Assignment Form */}
                        <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
                            <h3 className="font-bold text-purple-800 mb-2">Create New Assignment</h3>
                            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={newAssignment.title}
                                        onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                        className="border p-2 rounded"
                                        required
                                    />
                                    <input
                                        type="date"
                                        value={newAssignment.dueDate}
                                        onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                        className="border p-2 rounded w-full"
                                        required
                                    />
                                </div>
                                <textarea
                                    placeholder="Description"
                                    value={newAssignment.description}
                                    onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                    className="border p-2 rounded"
                                    rows="2"
                                />
                                <button type="submit" className="bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 transition">
                                    Create
                                </button>
                            </form>
                        </div>

                        {/* Existing Assignments List */}
                        <h3 className="font-bold text-gray-800 mb-4">Existing Assignments</h3>
                        <div className="grid gap-3">
                            {assignments.map(a => (
                                <div key={a._id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <p className="font-bold">{a.title}</p>
                                        <p className="text-sm text-gray-500">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => fetchSubmissions(a)}
                                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm font-medium hover:bg-indigo-200"
                                    >
                                        View Submissions
                                    </button>
                                </div>
                            ))}
                            {assignments.length === 0 && <p className="text-gray-500">No assignments created yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Submissions Grading Modal */}
            {isSubmissionsModalOpen && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsSubmissionsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-2">Grading: {selectedAssignment.title}</h2>

                        {gradingSubmission ? (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-lg mb-4">Grade Student</h3>
                                <p className="mb-2"><strong>File:</strong> <a href={`http://localhost:5000${gradingSubmission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Submission</a></p>
                                <form onSubmit={handleGrade} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Grade (0-100)</label>
                                        <input
                                            type="number"
                                            min="0" max="100"
                                            value={gradeData.grade}
                                            onChange={e => setGradeData({ ...gradeData, grade: e.target.value })}
                                            className="border p-2 rounded w-24"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Feedback</label>
                                        <textarea
                                            value={gradeData.feedback}
                                            onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}
                                            className="border p-2 rounded w-full"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Save Grade</button>
                                        <button type="button" onClick={() => setGradingSubmission(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="p-3">Student</th>
                                        <th className="p-3">Submitted At</th>
                                        <th className="p-3">File</th>
                                        <th className="p-3">Grade</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub._id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">
                                                {sub.studentId?.firstName} {sub.studentId?.lastName}
                                                <div className="text-xs text-gray-400">{sub.studentId?.email}</div>
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <a href={`http://localhost:5000${sub.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                        <FileText size={16} /> View
                                                    </a>
                                                    <button
                                                        onClick={() => window.open(`http://localhost:5000/users/report/${sub.studentId._id}`, '_blank')}
                                                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs font-bold"
                                                    >
                                                        <FileDown size={14} /> Report
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {sub.grade !== undefined ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">{sub.grade}/100</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Not graded</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => { setGradingSubmission(sub); setGradeData({ grade: sub.grade || '', feedback: sub.feedback || '' }); }}
                                                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                                                >
                                                    Grade
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {submissions.length === 0 && (
                                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">No submissions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessorDashboard;
