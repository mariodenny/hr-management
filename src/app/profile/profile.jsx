'use client';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/employee/2`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setMessage('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!oldPassword || !newPassword) {
      setMessage('Please enter both old and new passwords.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/employee/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || 'Failed to update password');
        return;
      }

      setMessage('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Password update error:', err);
      setMessage('Something went wrong while updating password.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <p className="text-lg text-red-600">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">👤 My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Name</span>
            <span className="text-lg text-gray-900 font-semibold">{profile.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Email</span>
            <span className="text-lg text-gray-900">{profile.email}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Position</span>
            <span className="text-lg text-gray-900">{profile.position}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Division</span>
            <span className="text-lg text-gray-900">{profile.division}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Username</span>
            <span className="text-lg text-gray-900">{profile.username}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Role</span>
            <span className="text-lg text-gray-900">{profile.role}</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Old Password
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="Enter old password"
              className="w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              className="w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'} mt-2`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg"
          >
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
}
