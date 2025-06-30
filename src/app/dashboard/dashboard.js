'use client'

import React, { useEffect, useState } from 'react';
import { Clock, Users, CalendarDays, Wallet, Briefcase, BookOpen, HandCoins } from 'lucide-react';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE = 'http://localhost:3000/api';

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const fetchAPI = async (endpoint) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch data');
            }
            return await res.json();
        } catch (err) {
            console.error('API fetch error:', err);
            throw err;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rawUser = localStorage.getItem('user');
                const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                if (!parsedUser) throw new Error('You are not logged in. Please log in to view the dashboard.');

                setUser(parsedUser);

                let result = {};

                if (parsedUser.role === 'HR') {
                    const [employees, leaves, salaries] = await Promise.all([
                        fetchAPI('/employee'),
                        fetchAPI('/leave/manage'),
                        fetchAPI('/salary'),
                    ]);
                    result = { employees, leaves, salaries };
                } else if (parsedUser.role === 'EMPLOYEE') {
                    const [attendance, leaves, salaries] = await Promise.all([
                        fetchAPI('/attendance'),
                        fetchAPI('/leave'),
                        fetchAPI('/salary/mine'),
                    ]);
                    result = { attendance, leaves, salaries };
                } else {
                    throw new Error('Unauthorized role. Please contact support.');
                }

                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]); // Depend on token to re-fetch if it changes

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 p-8">
                <p className="text-xl text-gray-700 flex items-center">
                    <Clock className="animate-spin mr-3 text-blue-500" size={28} />
                    Loading dashboard data...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-50 p-8">
                <div className="bg-white p-10 rounded-xl shadow-lg border border-red-200 text-center max-w-md w-full">
                    <p className="text-2xl text-red-600 font-bold mb-4">Error Loading Dashboard</p>
                    <p className="text-lg text-red-500 mb-6">{error}</p>
                    <p className="text-md text-gray-600">Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Welcome, <span className="text-indigo-600">{user?.name || 'User'}!</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        {user?.role === 'HR' ? 'HR Management Dashboard' : 'Your Personal Dashboard'}
                    </p>
                </div>

                {/* HR Dashboard View */}
                {user?.role === 'HR' && (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Employees Overview */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">Employees</h2>
                                    <Users className="h-7 w-7 text-indigo-500" />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Quick overview of all active employees.
                                </p>
                                {data.employees?.length ? (
                                    <ul className="space-y-4">
                                        {data.employees.slice(0, 5).map((emp) => ( // Limit to 5 for brevity
                                            <li key={emp.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                                <Briefcase className="h-5 w-5 text-gray-600 mr-4 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-800 text-lg">{emp.name}</p>
                                                    <p className="text-sm text-gray-500">{emp.email}</p>
                                                </div>
                                            </li>
                                        ))}
                                        {data.employees.length > 5 && (
                                            <li className="text-center text-md text-gray-600 mt-4 italic">
                                                And {data.employees.length - 5} more...
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg border border-gray-200">
                                        <Users className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                                        <p>No employees registered yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Leave Requests Overview (HR) */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">Leave Requests</h2>
                                    <BookOpen className="h-7 w-7 text-purple-500" />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Review pending and approved leave applications.
                                </p>
                                {data.leaves?.length ? (
                                    <ul className="space-y-4">
                                        {data.leaves.slice(0, 5).map((leave) => (
                                            <li key={leave.id} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                                <CalendarDays className="h-5 w-5 text-gray-600 mr-4 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="font-medium text-gray-800 text-lg">{leave.user?.name || 'Unknown Employee'}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {leave.startDate} to {leave.endDate}
                                                    </p>
                                                    <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold
                                                        ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                            leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                        {data.leaves.length > 5 && (
                                            <li className="text-center text-md text-gray-600 mt-4 italic">
                                                And {data.leaves.length - 5} more...
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg border border-gray-200">
                                        <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                                        <p>No leave requests to display.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Salaries Overview (HR) */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">Salaries</h2>
                                    <HandCoins className="h-7 w-7 text-green-500" />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Recent salary payouts and financial records.
                                </p>
                                {data.salaries?.length ? (
                                    <ul className="space-y-4">
                                        {data.salaries.slice(0, 5).map((sal) => (
                                            <li key={sal.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                                <Wallet className="h-5 w-5 text-gray-600 mr-4 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-800 text-lg">{sal.user?.name || 'Unknown Employee'}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {sal.period} — <span className="font-bold text-green-700">{formatCurrency(sal.amount)}</span>
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                        {data.salaries.length > 5 && (
                                            <li className="text-center text-md text-gray-600 mt-4 italic">
                                                And {data.salaries.length - 5} more...
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg border border-gray-200">
                                        <Wallet className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                                        <p>No salary records available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Employee Dashboard View */}
                {user?.role === 'EMPLOYEE' && (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* My Attendance Overview */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">My Attendance</h2>
                                    <Clock className="h-7 w-7 text-blue-500" />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Your recent check-in and check-out times.
                                </p>
                                {data.attendance?.length ? (
                                    <ul className="space-y-4">
                                        {data.attendance.slice(0, 5).map((a) => (
                                            <li key={a.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                                <CalendarDays className="h-5 w-5 text-gray-600 mr-4 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-800 text-lg">{a.date}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Check In: {a.checkInTime || '-'} | Out: {a.checkOutTime || '-'}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                        {data.attendance.length > 5 && (
                                            <li className="text-center text-md text-gray-600 mt-4 italic">
                                                And {data.attendance.length - 5} more...
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg border border-gray-200">
                                        <Clock className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                                        <p>No attendance records found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* My Leaves Overview (Employee) */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">My Leaves</h2>
                                    <BookOpen className="h-7 w-7 text-orange-500" />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Your submitted leave requests and their status.
                                </p>
                                {data.leaves?.length ? (
                                    <ul className="space-y-4">
                                        {data.leaves.slice(0, 5).map((leave) => (
                                            <li key={leave.id} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                                <CalendarDays className="h-5 w-5 text-gray-600 mr-4 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="font-medium text-gray-800 text-lg">{leave.startDate} to {leave.endDate}</p>
                                                    <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold
                                                        ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                            leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                        {data.leaves.length > 5 && (
                                            <li className="text-center text-md text-gray-600 mt-4 italic">
                                                And {data.leaves.length - 5} more...
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg border border-gray-200">
                                        <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                                        <p>No leave requests submitted yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* My Salaries Overview (Employee) */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">My Salaries</h2>
                                    <Wallet className="h-7 w-7 text-teal-500" />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Your past salary records and details.
                                </p>
                                {data.salaries?.length ? (
                                    <ul className="space-y-4">
                                        {data.salaries.slice(0, 5).map((sal) => (
                                            <li key={sal.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                                <HandCoins className="h-5 w-5 text-gray-600 mr-4 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-800 text-lg">Period: {sal.period}</p>
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-bold text-green-700">{formatCurrency(sal.amount)}</span> — {sal.note || 'No notes'}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                        {data.salaries.length > 5 && (
                                            <li className="text-center text-md text-gray-600 mt-4 italic">
                                                And {data.salaries.length - 5} more...
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg border border-gray-200">
                                        <Wallet className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                                        <p>No salary records found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}