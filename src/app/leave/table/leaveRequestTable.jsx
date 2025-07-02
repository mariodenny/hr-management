'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, FileText, Check, X } from 'lucide-react';

export default function LeaveRequestTable({ requests, onStatusUpdate }) {
    const [loadingId, setLoadingId] = useState(null);

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setLoadingId(id);
        try {
            const res = await fetch('http://localhost:3000/api/leave/manage', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    id,
                    status: newStatus,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                alert(result.error || 'Failed to update status');
                return;
            }

            alert(`Status updated to ${newStatus}`);
            if (onStatusUpdate) onStatusUpdate(id, newStatus);
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="w-full bg-white shadow rounded-lg overflow-hidden">
            <div className="border-b px-6 py-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-900" />
                <h2 className="text-lg font-semibold text-gray-800">Leave Requests Overview</h2>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-gray-600 border-b">Employee</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-600 border-b">Start Date</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-600 border-b">End Date</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-600 border-b">Duration</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-600 border-b">Status</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-600 border-b">Reason</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-600 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => {
                            const duration =
                                Math.ceil(
                                    (new Date(request.endDate) - new Date(request.startDate)) /
                                    (1000 * 60 * 60 * 24)
                                ) + 1;

                            return (
                                <tr
                                    key={request.id}
                                    className="hover:bg-gray-50 transition-colors border-b"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium text-gray-800">
                                                {request.user?.name || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            {format(new Date(request.startDate), 'MMM dd, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            {format(new Date(request.endDate), 'MMM dd, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800">
                                        {duration} day{duration > 1 ? 's' : ''}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                request.status
                                            )}`}
                                        >
                                            {request.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs text-sm text-gray-700 truncate">
                                        {request.reason}
                                    </td>
                                    <td className="px-6 py-4">
                                        {request.status === 'PENDING' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(request.id, 'ACCEPTED')}
                                                    disabled={loadingId === request.id}
                                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                                >
                                                    <Check className="w-4 h-4 inline mr-1" /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(request.id, 'REJECTED')}
                                                    disabled={loadingId === request.id}
                                                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                                >
                                                    <X className="w-4 h-4 inline mr-1" /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
