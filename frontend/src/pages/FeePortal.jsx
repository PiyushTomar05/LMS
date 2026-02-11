import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const FeePortal = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/fees/my-fees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFees(res.data);
        } catch (error) {
            toast.error('Failed to load fees');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (feeId, amount) => {
        try {
            const token = localStorage.getItem('token');
            // Simulate Payment Gateway
            const transactionId = `TXN-${Date.now()}`;

            await axios.post('http://localhost:5000/fees/pay', {
                feePaymentId: feeId,
                amount: amount,
                method: 'ONLINE',
                transactionId,
                remarks: 'Student Self Payment'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Payment Successful!');
            fetchFees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your fee details...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Fee Portal</h1>
            <p className="text-gray-500 mb-8">Manage your semester fees and view transaction history.</p>

            {fees.length === 0 ? (
                <div className="bg-white p-10 rounded-xl shadow text-center">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">No Dues Pending</h3>
                    <p className="text-gray-500">You are all caught up!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {fees.map((fee) => (
                        <div key={fee._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                            {/* Left: Status & Details */}
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    fee.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {fee.status}
                                            </span>
                                            <span className="text-sm text-gray-400">#{fee.invoiceNumber}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{fee.feeStructureId?.name || 'Semester Fee'}</h3>
                                        <p className="text-sm text-gray-500">Due: {new Date(fee.feeStructureId?.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Payable</p>
                                        <p className="text-2xl font-bold text-gray-900">${fee.totalPayable}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Paid Amount</p>
                                        <p className="font-semibold text-gray-900">${fee.paidAmount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Remaining</p>
                                        <p className={`font-semibold ${fee.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${fee.remainingAmount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="bg-gray-50 p-6 flex flex-col justify-center gap-3 border-l border-gray-100 md:w-64">
                                {fee.status !== 'PAID' ? (
                                    <button
                                        onClick={() => handlePay(fee._id, fee.remainingAmount)}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all"
                                    >
                                        <CreditCard size={18} /> Pay Now
                                    </button>
                                ) : (
                                    <button className="w-full bg-white text-gray-700 border border-gray-200 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                                        <Download size={18} /> Receipt
                                    </button>
                                )}
                                {fee.status === 'OVERDUE' && (
                                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                        <AlertCircle size={14} /> Late fees may apply
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeePortal;
