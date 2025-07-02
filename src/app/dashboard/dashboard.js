'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import { Clock, Users, CalendarDays,Wallet, Briefcase, BookOpen, HandCoins, CheckCircle, Menu, X, Bell, Settings, LogOut, Home, BarChart3, UserCheck } from 'lucide-react';

export default function DashboardPage() {
const [user, setUser] = useState(null)
  const [data, setData] = useState({ attendance: [], leaves: [], salaries: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState('');

  const API_BASE = 'http://localhost:3000/api'
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchAPI = async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`)
    return await res.json()
  }

  useEffect(() => {
    const fetchAttendanceToday = async () => {
        try{
            const token = localStorage.getItem('token')
            const res = await fetch('/api/attendance/today', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
             });

            const result = await res.json()

            if(!res.ok){
                console.error(result.error)
                return
            }

           if (result.attendance) {
            if (result.attendance?.checkIn && !result.attendance?.checkOut) {
                setHasCheckedInToday(true);
                } else {
                setHasCheckedInToday(false);
                }
                setAttendanceStatus(result.attendance.status); 
            }

        }catch(err){
            console.error(err);
        }
    };
    fetchAttendanceToday()


    const loadData = async () => {
      try {
        const raw = localStorage.getItem('user')
        const parsed = JSON.parse(raw)
        if (!parsed) throw new Error('No user data in localStorage')

        setUser(parsed)

        let result = {}

        if (parsed.role === 'HR') {
          const [employees, leaves, salaries] = await Promise.all([
            fetchAPI('/employee'),
            fetchAPI('/leave/manage'),
            fetchAPI('/salary'),
          ])
          result = { employees, leaves, salaries }
        } else {
          const [attendance, leaves, salaries] = await Promise.all([
            fetchAPI('/attendance'),
            fetchAPI('/leave'),
            fetchAPI('/salary/mine'),
          ])
          result = { attendance, leaves, salaries }
        }

        setData(result)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

const handleAttendance = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const location = `${latitude},${longitude}`;

      try {
        const token = localStorage.getItem('token');

        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ location }),
        });

        const result = await res.json();

        if (!res.ok) {
          alert(result.error || 'Failed');
          return;
        }

        if (result.attendance?.status) {
         setAttendanceStatus(result.attendance.status);
        }

        if (result.message.includes('Check-in')) {
          setHasCheckedInToday(true);
        } else if (result.message.includes('Check-out')) {
          setHasCheckedInToday(false);
        }

        alert(result.message);
      } catch (err) {
        console.error(err);
        alert('Something went wrong');
      }
    },
    (error) => {
      console.error(error);
      alert('Cannot get your location');
    }
  );
};


  const handleLogout = async()=>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
  }
  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    // { id: 'profile', label:'Profile', icon : Home }
  ]

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <Clock className="animate-spin mx-auto mb-4 text-blue-500" size={40} />
                    <p className="text-xl text-gray-700">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 text-center max-w-md mx-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo & Brand */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    HRM
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveNav(item.id)}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                            activeNav === item.id
                                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                            {/* <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-800">
                                    {user?.name}
                                </span>
                            </div> */}
                            <Link href="/profile" className="flex items-center space-x-3 cursor-pointer">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-red-400 hover:text-red-800 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200">
                    <div className="px-4 py-2 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveNav(item.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                                        activeNav === item.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mr-3" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section with Attendance Button */}
                <div className="mb-8">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                            <div className="mb-6 lg:mb-0">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Welcome, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.name}!</span>
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    {user?.role === 'HR' ? 'Manage your team effectively' : 'Ready to start your productive day?'}
                                </p>
                                <div className="flex items-center mt-3 text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {new Date().toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </div>
                            </div>
                            
                            {user?.role === 'EMPLOYEE' && (
                                <div className="flex flex-col items-center lg:items-end">
                                    <button
                                        onClick={handleAttendance}
                                        className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                        hasCheckedInToday
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                        : attendanceStatus === 'LATE'
                                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                                        }`}>
                                        <div className="flex items-center">
                                            {hasCheckedInToday ? (
                                                <>
                                                    <CheckCircle className="w-6 h-6 mr-3" />
                                                    Check Out
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="w-6 h-6 mr-3" />
                                                    Check In
                                                </>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </button>
                                    <p className={`text-lg mt-2 ${attendanceStatus === 'LATE' ? 'text-red-500' : 'text-gray-500'}`}>
                                        {hasCheckedInToday
                                        ? `You checked in today : ${attendanceStatus.toLowerCase()}`
                                        : 'Tap to mark your attendance'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                {activeNav === 'dashboard' && (
                    <>
                        {/* Quick Stats Kalau ada request nanti bisa di unlcok coment nya */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">This Month</p>
                                        <p className="text-2xl font-bold text-gray-900">22 Days</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Present</p>
                                        <p className="text-2xl font-bold text-gray-900">20 Days</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                                <div className="flex items-center">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <CalendarDays className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Leave Balance</p>
                                        <p className="text-2xl font-bold text-gray-900">8 Days</p>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Main Dashboard Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {/* Attendance Card */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900">Recent Attendance</h3>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {data.attendance?.slice(0, 3).map((record) => (
                                            <div key={record.id} className="flex items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-gray-100/50 transition-colors">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                                    <CalendarDays className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{record.date}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {record.checkInTime} - {record.checkOutTime || 'Active'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Leave Requests */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900">Leave Requests</h3>
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {data.leaves?.slice(0, 3).map((leave) => (
                                            <div key={leave.id} className="flex items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-gray-100/50 transition-colors">
                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                                    <CalendarDays className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {leave.startDate} - {leave.endDate}
                                                    </p>
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                        leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Salary Information */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900">Salary Records</h3>
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Wallet className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {data.salaries?.slice(0, 3).map((salary) => (
                                            <div key={salary.id} className="flex items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-gray-100/50 transition-colors">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                                    <HandCoins className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{salary.period}</p>
                                                    <p className="text-sm font-semibold text-green-700">
                                                        {formatCurrency(salary.amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Other Navigation Content */}
                {activeNav === 'attendance' && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-8 text-center">
                        <UserCheck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h2>
                        <p className="text-gray-600">Detailed attendance tracking and management features coming soon.</p>
                    </div>
                )}

                {activeNav === 'reports' && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-8 text-center">
                        <BarChart3 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
                        <p className="text-gray-600">Comprehensive reporting and analytics dashboard coming soon.</p>
                    </div>
                )}
            </main>
        </div>
    );
}