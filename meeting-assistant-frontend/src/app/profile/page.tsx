'use client';

import { useAuth } from '@/contexts/AuthContext';
import Panda from '@/app/components/Panda';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative">
      {/* Background Panda */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Panda success={true} />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col z-10">
        <h2 className="text-2xl font-bold mb-6">Meeting Assistant</h2>
        <nav className="flex flex-col gap-4 mb-4">
          <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
          <Link href="/meetings" className="hover:text-blue-400">Meetings</Link>
          <Link href="/tasks" className="hover:text-blue-400">Tasks</Link>
          <Link href="/profile" className="hover:text-blue-400">Profile</Link>
        </nav>

        {/* Logout button */}
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 relative z-10">
        {/* Action Panda */}
        <div className="fixed bottom-6 right-6 w-32 h-32 z-20">
          <Panda success={true} />
        </div>

        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700 max-w-md">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-1">Name</h2>
            <p className="text-white">{user?.name || 'N/A'}</p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-1">Email</h2>
            <p className="text-white">{user?.email || 'N/A'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
