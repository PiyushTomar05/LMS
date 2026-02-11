import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Check, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const FeeManager = () => {
    const [formData, setFormData] = useState({
        name: '', description: '', academicYear: '2023-2024', semester: 'Fall',
        tuitionFee: 0, libraryFee: 0, labFee: 0, transportFee: 0, otherFee: 0,
        dueDate: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const createStructure = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Convert strings to numbers
            const payload = {
                ...formData,
                tuitionFee: Number(formData.tuitionFee),
                libraryFee: Number(formData.libraryFee),
                labFee: Number(formData.labFee),
                transportFee: Number(formData.transportFee),
                otherFee: Number(formData.otherFee),
            };

            await axios.post('http://localhost:5000/fees/structure', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Fee Structure Created!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Fee Management</h1>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Plus className="text-blue-600" /> Create New Fee Structure
                </h2>

                <form onSubmit={createStructure} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" onChange={handleChange} placeholder="Structure Name (e.g. B.Tech Sem 1)" className="p-2 border rounded w-full" required />
                        <input name="academicYear" onChange={handleChange} placeholder="Academic Year" defaultValue="2023-2024" className="p-2 border rounded w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input name="semester" onChange={handleChange} placeholder="Semester" defaultValue="Fall" className="p-2 border rounded w-full" />
                        <input type="date" name="dueDate" onChange={handleChange} className="p-2 border rounded w-full" required />
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
                        <div className="col-span-3 text-sm font-bold text-blue-800 mb-1">Fee Breakdown ($)</div>
                        <input type="number" name="tuitionFee" onChange={handleChange} placeholder="Tuition" className="p-2 border rounded" />
                        <input type="number" name="libraryFee" onChange={handleChange} placeholder="Library" className="p-2 border rounded" />
                        <input type="number" name="labFee" onChange={handleChange} placeholder="Lab" className="p-2 border rounded" />
                        <input type="number" name="transportFee" onChange={handleChange} placeholder="Transport" className="p-2 border rounded" />
                        <input type="number" name="otherFee" onChange={handleChange} placeholder="Other" className="p-2 border rounded" />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
                        Create Structure
                    </button>
                </form>
            </div>

            {/* Placeholder for Assigning Logic */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-md max-w-3xl opacity-75">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="text-purple-600" />
                    <h2 className="text-xl font-semibold">Assign Fees</h2>
                </div>
                <p className="text-gray-500 mb-4">Bulk assign created structures to student batches (Coming Soon: Select Batch feature).</p>
                <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded">Assign to Batch</button>
            </div>
        </div>
    );
};

export default FeeManager;
