'use client';

import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Panda from '../Panda';

interface MainLayoutProps {
  children: ReactNode;
  actionPandaSuccess?: boolean;
}

export default function MainLayout({ children, actionPandaSuccess = false }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col z-10">
        <h2 className="text-2xl font-bold mb-6">Meeting Assistant</h2>
        <nav className="flex flex-col gap-4">
          <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
          <a href="/meetings" className="hover:text-blue-400">Meetings</a>
          <a href="/tasks" className="hover:text-blue-400">Tasks</a>
          <a href="/profile" className="hover:text-blue-400">Profile</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 relative z-10">
        {/* Background Panda */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Panda success={true} />
        </div>

        {/* Action Panda */}
        <div className="fixed bottom-6 right-6 w-32 h-32 z-20">
          <Panda success={actionPandaSuccess} />
        </div>

        {/* Page children */}
        {children}
      </main>
    </div>
  );
}
