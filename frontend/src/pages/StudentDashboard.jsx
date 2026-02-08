import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, Calendar, FileText, Download, FileDown, Upload, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Announcements from '../components/Announcements';
import ResourceManager from '../components/ResourceManager';

import DigitalIDCard from '../components/DigitalIDCard';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [fees, setFees] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const [mySubmissions, setMySubmissions] = useState({}); // { assignmentId: submissionObj }

    useEffect(() => {
        // ... (data fetching logic remains same)
        const fetchData = async () => {
            try {
                const [courseRes, attendanceRes, submissionsRes, feesRes] = await Promise.all([
                    api.get('/courses/student/my-courses'),
                    api.get(`/attendance/student/${user.id}`),
                    api.get('/assignments/student/my-submissions'),
                    api.get('/fees/my-fees')
                ]);
                setCourses(courseRes.data);
                setAttendanceStats(attendanceRes.data);
                setFees(feesRes.data);

                const subMap = {};
                submissionsRes.data.forEach(sub => {
                    subMap[sub.assignmentId] = sub;
                });
                setMySubmissions(subMap);

                if (courseRes.data.length > 0) {
                    const assignmentsRes = await Promise.all(
                        courseRes.data.map(c => api.get(`/assignments/course/${c._id}`))
                    );
                    const allAssignments = assignmentsRes.flatMap(r => r.data);
                    setAssignments(allAssignments);
                }
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        if (user) fetchData();
    }, [user]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const submitAssignment = async (e) => {
        e.preventDefault();
        if (!file) return toast.error("Please select a file");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignmentId', selectedAssignment._id);

        try {
            await api.post('/assignments/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Assignment submitted successfully');
            setSelectedAssignment(null);
            setFile(null);
        } catch (error) {
            console.error(error);
            toast.error('Submission failed');
        }
    };

    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    return (
        <div className="flex flex-col gap-6 p-8 min-h-screen">
            {/* Top Section: Profile & ID Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SIS Profile Card */}
                <div className="lg:col-span-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl animate-fade-in relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                    {user.urn || 'URN Pending'}
                                </span>
                            </div>
                            <p className="text-indigo-100 font-medium mb-1">{user.department || 'General'} Department • {user.program || 'Program N/A'}</p>
                            <div className="flex gap-4 text-sm text-indigo-200">
                                <span>Roll No: {user.rollNumber || 'N/A'}</span>
                                <span>•</span>
                                <span>Sem: {user.semester || 1} ({user.academicYear || '2023-24'})</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Attendance</p>
                                <p className="text-2xl font-bold">{attendanceStats?.overall?.percentage || 0}%</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-wider text-indigo-200 font-bold">CGPA</p>
                                <p className="text-2xl font-bold">{user.cgpa || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Digital ID Card (Flippable) */}
                <div className="flex items-center justify-center">
                    <DigitalIDCard student={user} universityName="LMS University" />
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 animate-fade-in">My Enrollment</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.open(`http://localhost:5000/users/report/${user.id}`, '_blank')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileDown size={20} /> Download Report Card
                    </button>
                </div>
            </div>

            {/* Announcements Section */}
            <Announcements userRole="STUDENT" />

            {/* Fees Section */}
            <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
                <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 bg-emerald-500 rounded-full inline-block"></span>
                    Fees & Payments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fees.map((fee) => (
                        <div key={fee._id} className="bg-white border border-slate-200 p-6 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-slate-800">{fee.type} Fee</h3>
                                <p className="text-xs text-slate-500 font-medium">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                <p className="text-xl font-black text-slate-700 mt-2">${fee.amount}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {fee.status}
                            </div>
                        </div>
                    ))}
                    {fees.length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No pending fees.
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Schedule Section */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 bg-violet-500 rounded-full inline-block"></span>
                    Weekly Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((c, idx) => (
                        <div key={c._id} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{c.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">Professor: {c.professorId?.firstName} {c.professorId?.lastName}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {c.schedule && c.schedule.length > 0 ? (
                                    c.schedule.map((slot, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                                            <span className="font-bold text-slate-600 uppercase tracking-tight">{slot.day}</span>
                                            <span className="text-slate-500">{slot.startTime} - {slot.endTime}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No schedule set</p>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedCourseId(c._id);
                                    setIsResourceModalOpen(true);
                                }}
                                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <BookOpen size={14} /> View Resources
                            </button>
                        </div>
                    ))}
                    {courses.length === 0 && (
                        <div className="col-span-full py-12 bg-white border border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                            <BookOpen size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">You are not enrolled in any courses yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance Section */}
            <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
                <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 bg-sky-500 rounded-full inline-block"></span>
                    Attendance Report
                </h2>

                {/* Overall Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${!attendanceStats?.overall ? 'bg-slate-100 text-slate-400' :
                            parseFloat(attendanceStats.overall.percentage) >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {attendanceStats?.overall?.percentage || 0}%
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Overall Attendance</p>
                            <p className="font-medium text-slate-700">
                                {attendanceStats?.overall?.presentClasses || 0} / {attendanceStats?.overall?.totalClasses || 0} Classes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Course-wise Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {attendanceStats?.courses?.map(c => (
                        <div key={c._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-slate-800 line-clamp-1">{c.courseName}</h4>
                                    <p className="text-xs text-slate-500 font-mono">{c.courseCode}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${c.percentage >= 75 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {c.percentage.toFixed(1)}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full rounded-full ${c.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${c.percentage}%` }}
                                ></div>
                            </div>

                            <p className="text-xs text-slate-500 text-right">
                                {c.presentClasses} Present / {c.totalClasses} Total
                            </p>
                        </div>
                    ))}
                    {(!attendanceStats?.courses || attendanceStats.courses.length === 0) && (
                        <div className="col-span-full text-center py-8 text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
                            No attendance records found.
                        </div>
                    )}
                </div>
            </div>

            {/* Assignments Section */}
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 bg-primary-500 rounded-full inline-block"></span>
                    Assignments & Tasks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignments.map((assignment) => {
                        const submission = mySubmissions[assignment._id];
                        const isGraded = submission && submission.grade !== undefined;

                        return (
                            <div key={assignment._id} className="bg-white border border-slate-200 p-6 rounded-3xl hover:shadow-xl transition-all duration-300 flex flex-col group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{assignment.title}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{assignment.courseId?.name}</p>
                                        </div>
                                    </div>
                                    {isGraded ? (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                            {submission.grade}/100
                                        </span>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${submission ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {submission ? 'SUBMITTED' : 'PENDING'}
                                        </span>
                                    )}
                                </div>

                                <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">{assignment.description}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                    <div className="text-xs">
                                        <p className="text-slate-400 font-bold uppercase tracking-tighter">Due Date</p>
                                        <p className="text-slate-700 font-bold">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                                    </div>

                                    {!submission ? (
                                        <button
                                            onClick={() => setSelectedAssignment(assignment)}
                                            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2"
                                        >
                                            <Upload size={16} /> Submit
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                            <CheckCircle size={18} /> Done
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div >

            {/* Submit Assignment Modal */}
            {
                selectedAssignment && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md relative animate-slide-up border border-slate-100">
                            <button
                                onClick={() => setSelectedAssignment(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Submit Work</h2>
                                <p className="text-slate-500 font-medium">{selectedAssignment.title}</p>
                            </div>

                            <form onSubmit={submitAssignment} className="space-y-6">
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-primary-400 transition-colors cursor-pointer bg-slate-50/50">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        required
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer w-full">
                                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 mx-auto mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                            <Upload size={28} />
                                        </div>
                                        <p className="font-bold text-slate-700 mb-1">{file ? file.name : 'Select PDF or Hand-in'}</p>
                                        <p className="text-xs text-slate-400 font-medium">Max size: 5MB</p>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-lg hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} className="rotate-180" /> Send Submission
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Resource Modal Instance */}
            {
                isResourceModalOpen && (
                    <ResourceManager
                        isOpen={isResourceModalOpen}
                        onClose={() => setIsResourceModalOpen(false)}
                        courseId={selectedCourseId}
                    />
                )
            }
        </div >
    );
};

export default StudentDashboard;
