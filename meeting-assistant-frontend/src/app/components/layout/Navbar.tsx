// src/app/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">Meeting Assistant</div>
      <div className="flex space-x-2">
        <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
        <Link href="/tasks" className={linkClass('/tasks')}>Tasks</Link>
        <Link href="/meetings" className={linkClass('/meetings')}>Meetings</Link>
        <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
      </div>
    </nav>
  );
}
