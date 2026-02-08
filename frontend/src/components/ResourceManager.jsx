import React, { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { FileText, Download, Trash2, Upload, Link as LinkIcon, X } from 'lucide-react';

const ResourceManager = ({ courseId, isTeacher, onClose }) => {
    const [resources, setResources] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', description: '', fileUrl: '' });
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (courseId) fetchResources();
    }, [courseId]);

    const fetchResources = async () => {
        try {
            const { data } = await api.get(`/resources/course/${courseId}`);
            setResources(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('title', newResource.title);
        formData.append('description', newResource.description);

        // For simulation, we might send fileUrl if no file selected (external link)
        if (file) {
            formData.append('file', file);
        } else if (newResource.fileUrl) {
            formData.append('fileUrl', newResource.fileUrl);
        } else {
            return toast.error("Please provide a file or a link");
        }

        try {
            // Note: If sending FormData with 'file', Content-Type is multipart/form-data.
            // If sending JSON (link), it's application/json.
            // Our backend route uses upload.single('file'), which expects multipart.
            // If we want to support links only, we might need a workaround or just stick to files for now.
            // Let's assume purely file upload for simplicity or mixed if backend supports checks.

            // Assuming backend prioritizes req.file but falls back to req.body.fileUrl if we adjust handling.
            // Current backend implementation looks for req.file OR req.body.fileUrl.
            // But multer middleware might complain if not multipart.
            // Let's send everything as FormData.

            await api.post('/resources', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Resource uploaded!");
            setNewResource({ title: '', description: '', fileUrl: '' });
            setFile(null);
            setShowUpload(false);
            fetchResources();
        } catch (error) {
            toast.error("Upload failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this resource?")) return;
        try {
            await api.delete(`/resources/${id}`);
            toast.success("Deleted");
            fetchResources();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl animate-scale-in">
                <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/40">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-indigo-600">Course Resources</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-violet-600 transition-colors p-1 hover:bg-white/50 rounded-full"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {isTeacher && (
                        <div className="mb-6">
                            {!showUpload ? (
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-200 w-full justify-center transition-all"
                                >
                                    <Upload size={18} /> Upload New Resource
                                </button>
                            ) : (
                                <form onSubmit={handleUpload} className="bg-white/50 p-6 rounded-xl border border-white/40 animate-fade-in shadow-inner">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Upload size={18} className="text-violet-500" /> New Resource</h3>
                                        <button type="button" onClick={() => setShowUpload(false)} className="text-xs text-red-500 hover:underline font-bold">Cancel</button>
                                    </div>
                                    <div className="space-y-4">
                                        <input
                                            placeholder="Title"
                                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white/80"
                                            value={newResource.title}
                                            onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                            required
                                        />
                                        <textarea
                                            placeholder="Description (Optional)"
                                            className="w-full p-3 border border-slate-200 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white/80"
                                            value={newResource.description}
                                            onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                        />

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-600">Attach File:</label>
                                            <input
                                                type="file"
                                                onChange={e => setFile(e.target.files[0])}
                                                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                            />
                                        </div>

                                        <div className="text-center text-slate-400 text-xs font-bold my-2">- OR -</div>

                                        <div className="flex items-center gap-2">
                                            <LinkIcon size={16} className="text-slate-400" />
                                            <input
                                                placeholder="External Link (e.g., Google Drive)"
                                                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white/80"
                                                value={newResource.fileUrl}
                                                onChange={e => setNewResource({ ...newResource, fileUrl: e.target.value })}
                                            />
                                        </div>

                                        <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all mt-2">
                                            Upload Resource
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        {resources.length === 0 ? (
                            <div className="text-center py-12 bg-white/30 rounded-xl border border-dashed border-slate-300">
                                <FileText size={48} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-500 font-medium">No resources uploaded yet.</p>
                            </div>
                        ) : (
                            resources.map((res, idx) => (
                                <div key={res._id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:shadow-md transition-all hover:bg-white/80" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg text-indigo-600 shadow-sm">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{res.title}</h4>
                                            {res.description && <p className="text-sm text-slate-500 line-clamp-1">{res.description}</p>}
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>
                                                {new Date(res.createdAt).toLocaleDateString()} • By {res.uploadedBy?.firstName || 'User'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={res.fileUrl.startsWith('http') ? res.fileUrl : `${import.meta.env.VITE_API_URL}${res.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                            title="Download/Open"
                                        >
                                            <Download size={20} />
                                        </a>
                                        {isTeacher && (
                                            <button
                                                onClick={() => handleDelete(res._id)}
                                                className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceManager;
