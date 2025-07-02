'use client'
import { useState, useEffect } from 'react'
import { Wallet, Plus } from 'lucide-react'

export default function SalaryManager() {
    const [salaries, setSalaries] = useState([])
    const [form, setForm] = useState({ userId: '', period: '', amount: '' })
    const [employees, setEmployees] = useState([]);

    const [showModal, setShowModal] = useState(false)

    const token = localStorage.getItem('token')

    const fetchSalaries = async () => {
        const res = await fetch('/api/salary', {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setSalaries(data || [])
    }

    useEffect(() => {
        fetchSalaries()
        if (showModal) {
            fetch('/api/employee', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => setEmployees(data || []))
                .catch(err => console.error(err));
        }
    }, [showModal])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const res = await fetch('/api/salary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form)
        })
        if (res.ok) {
            fetchSalaries()
            setShowModal(false)
            setForm({ userId: '', period: '', amount: '' })
        }
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow border text-gray-900">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> Manage Salaries
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Salary
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Employee</th>
                            <th className="px-4 py-2 text-left">Period</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salaries.map((sal) => (
                            <tr key={sal.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{sal.user?.name}</td>
                                <td className="px-4 py-2">{sal.period}</td>
                                <td className="px-4 py-2">Rp {sal.amount.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Add Salary</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <select
                                value={form.userId}
                                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.position})
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Period (e.g., 2025-07)"
                                value={form.period}
                                onChange={(e) => setForm({ ...form, period: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
