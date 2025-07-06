'use client';

import { useEffect, useState } from 'react';
import LeaveRequestTable from '../table/leaveRequestTable';
import Swal from 'sweetalert2';

export default function LeaveRequestForm() {
    const [requests, setRequests] = useState([]);
    const [role, setRole] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const API_BASE = 'http://localhost:3000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setRole(user.role);
            fetchRequests();
        }
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_BASE}/leave`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            console.error('Failed to load requests:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate || !reason) {
            Swal.fire({
                icon: 'warning',
                title: 'Please fill all fields!',
            });
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    reason,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: result.error || 'Failed to create leave request.',
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: 'Leave request submitted!',
            });

            // Reset form
            setStartDate('');
            setEndDate('');
            setReason('');
            setShowForm(false);

            // Refresh table
            fetchRequests();

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error submitting leave.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mx-auto p-6 text-gray-800 text-md">
            <h1 className="text-2xl font-bold text-black mb-6">Leave Request</h1>

            {role === 'EMPLOYEE' && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {showForm ? 'Hide Form' : 'Add Leave Request'}
                    </button>
                </div>
            )}

            {role === 'EMPLOYEE' && !showForm && (
                <LeaveRequestTable requests={requests} />
            )}

            {role === 'EMPLOYEE' && showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-white p-6 rounded-lg shadow">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border px-3 py-2 rounded text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border px-3 py-2 rounded text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border px-3 py-2 rounded text-black"
                            rows={3}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        {loading ? 'Submitting...' : 'Submit Leave Request'}
                    </button>
                </form>
            )}

            {role === 'HR' && (
                <LeaveRequestTable
                    requests={requests}
                    onStatusUpdate={fetchRequests}
                    role={role}
                />
            )}
        </div>
    );
}
