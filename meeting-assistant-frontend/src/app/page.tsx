'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Panda from '@/app/components/Panda';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login'); // Not logged in → go to login
      } else {
        setShowWelcome(true); // Logged in → show welcome page
      }
    }
  }, [user, loading, router]);

  if (loading || !showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative">
      {/* Background Panda */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Panda success={false} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10">
        <div className="bg-gray-800 p-10 rounded-3xl max-w-md w-full text-center shadow-xl border border-gray-700">
          <h1 className="text-4xl font-bold mb-4">Welcome, {user?.name}!</h1>
          <p className="text-gray-300 mb-6">
            🎉 You're all set. Manage your meetings and tasks efficiently.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-500 transition px-8 py-3 rounded-xl font-semibold text-lg shadow-md"
          >
            Start Using
          </button>
        </div>
      </main>

      {/* Action Panda */}
      <div className="fixed bottom-6 right-6 w-32 h-32 z-20">
        <Panda success={true} />
      </div>
    </div>
  );
}
