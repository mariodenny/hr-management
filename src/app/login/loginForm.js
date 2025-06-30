'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock } from 'lucide-react'

export default function LoginPage() {
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const API_BASE = 'http://localhost:3000/api'

    const apiCall = async (endpoint, options = {}) => {
        const url = `${API_BASE}${endpoint}`
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        }

        try {
            const response = await fetch(url, config)
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || 'API Error')
            }
            return data
        } catch (err) {
            console.error('API Error:', err)
            throw err
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: loginForm.username,
                    password: loginForm.password,
                }),
            })

            if (response.token) {
                // Simpan ke localStorage
                localStorage.setItem('token', response.token)
                localStorage.setItem('user', JSON.stringify(response.user))

                // 🚀 Redirect ke dashboard
                router.push('/dashboard')
            }
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
            <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
                    Sign In
                </h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                            <input
                                type="text"
                                required
                                value={loginForm.username}
                                onChange={(e) =>
                                    setLoginForm({ ...loginForm, username: e.target.value })
                                }
                                placeholder="Your username"
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={loginForm.password}
                                onChange={(e) =>
                                    setLoginForm({ ...loginForm, password: e.target.value })
                                }
                                placeholder="Your password"
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !loginForm.username || !loginForm.password}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {/* <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        Please contact admin for account support.
                    </p>
                </div> */}
            </div>
        </div>
    )
}
