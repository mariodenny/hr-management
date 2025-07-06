'use client'
import { useState, useEffect } from 'react'
import { Plus, Users } from 'lucide-react'

export default function EmployeeManager() {
    const [employees, setEmployees] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        position: '',
        division: '',
        username: '',
        password: '', // only for create
    })
    const [editingId, setEditingId] = useState(null)

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const fetchEmployees = async () => {
        const res = await fetch('/api/employee', {
            headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setEmployees(data || [])
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const method = editingId ? 'PATCH' : 'POST'
        const url = editingId ? `/api/employee/${editingId}` : '/api/employee'

        // Copy only needed fields
        const body = {
            name: form.name,
            email: form.email,
            position: form.position,
            division: form.division,
            username: form.username,
        }

        if (!editingId) {
            // add password only for create
            body.password = form.password
        }

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        if (res.ok) {
            fetchEmployees()
            setShowModal(false)
            setEditingId(null)
            setForm({
                name: '',
                email: '',
                position: '',
                division: '',
                username: '',
                password: '',
            })
        } else {
            console.error('Failed to save employee')
        }
    }

    const handleEdit = (emp) => {
        setForm({
            name: emp.name,
            email: emp.email,
            position: emp.position,
            division: emp.division,
            username: emp.username,
            password: '', // do not edit password here
        })
        setEditingId(emp.id)
        setShowModal(true)
    }

    return (
        <div className="w-full p-6 bg-white rounded-xl shadow border text-black">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" /> Manage Employees
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> New Employee
                </button>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="min-w-[768px] sm:min-w-full border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Position</th>
                            <th className="px-4 py-2 text-left">Division</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{emp.name}</td>
                                <td className="px-4 py-2">{emp.email}</td>
                                <td className="px-4 py-2">{emp.position}</td>
                                <td className="px-4 py-2">{emp.division}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {['name', 'email', 'position', 'division', 'username'].map((field) => (
                                <input
                                    key={field}
                                    type="text"
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={form[field]}
                                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                    className="w-full border px-3 py-2 rounded"
                                    required
                                />
                            ))}
                            {!editingId && (
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full border px-3 py-2 rounded"
                                    required
                                />
                            )}
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false)
                                        setEditingId(null)
                                        setForm({
                                            name: '',
                                            email: '',
                                            position: '',
                                            division: '',
                                            username: '',
                                            password: '',
                                        })
                                    }}
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
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
