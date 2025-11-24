'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Panda from '@/app/components/Panda';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      console.log('✅ Login successful, redirecting to dashboard...');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      
      // Better error handling
      let msg = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        msg = err.response.data.message || 
              err.response.data.error || 
              err.response.data.msg ||
              msg;
      } else if (err.message) {
        msg = err.message;
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background Panda */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <Panda success={true} />
      </div>

      {/* Fixed Panda - Hidden on mobile */}
      <div className="hidden md:block fixed bottom-6 right-6 w-32 h-32 z-20">
        <Panda success={true} />
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 z-10 relative border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-4 text-white">Sign In</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-gray-300 mb-2 text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-300 mb-2 text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Min. 6 characters"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-gray-400 text-center text-sm">
          Don't have an account?{' '}
          <a
            href="/signup"
            className="text-blue-400 hover:text-blue-300 transition font-medium"
          >
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}