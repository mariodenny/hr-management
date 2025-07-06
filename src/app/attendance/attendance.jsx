'use client'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { CalendarDays } from 'lucide-react'

export default function AttendanceManager() {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)

    const API_BASE = 'http://localhost:3000/api'
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const fetchAttendanceAll = async () => {
        try {
            const res = await fetch(`${API_BASE}/attendance/all`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Failed to fetch attendance')

            const data = await res.json()
            if (!Array.isArray(data)) {
                setRecords([])
            } else {
                setRecords(data)
            }
        } catch (err) {
            console.error(err)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAttendanceAll()
    }, [])

    const cleanDateTime = (datetime) => {
        if (!datetime) return '-'
        return datetime.replace('T', ' ').replace('Z', '').split('.')[0]
    }

    const groupedRecords = records.reduce((acc, rec) => {
        const dateKey = rec.date.split('T')[0]
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(rec)
        return acc
    }, {})

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                <CalendarDays className="w-6 h-6 mr-2 text-blue-600" />
                Attendance Records by Day
            </h2>

            {loading ? (
                <p className="text-gray-900">Loading...</p>
            ) : records.length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(groupedRecords).map(([date, recs]) => (
                        <div key={date} className="border rounded-xl overflow-hidden shadow">
                            <div className="bg-gray-100 px-6 py-3 font-semibold text-gray-700">
                                {date}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-[480px] w-full text-left border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Check In</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
                                        {recs.map((rec) => (
                                            <tr key={rec.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">{rec.user?.name || '-'}</td>
                                                <td className="px-6 py-4">{cleanDateTime(rec.checkIn)}</td>
                                                <td className="px-6 py-4">{rec.checkOut ? cleanDateTime(rec.checkOut) : '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${rec.status === 'LATE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {rec.status || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No attendance records found.</p>
            )}
        </div>
    )
}
