'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { meetingsAPI, tasksAPI } from '@/lib/api';
import Panda from '@/app/components/Panda';
import { Calendar, CheckSquare, Clock, AlertCircle, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Meeting {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  meeting_link?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'in-progress' | 'cancelled';
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching dashboard data...');
      
      // Fetch both meetings and tasks
      const [meetingsData, tasksData] = await Promise.all([
        meetingsAPI.getMyMeetings(),
        tasksAPI.getMyTasks()
      ]);

      console.log('📊 Raw Meetings response:', meetingsData);
      console.log('📊 Raw Tasks response:', tasksData);

      // Ensure we have arrays
      const meetingsList = Array.isArray(meetingsData) ? meetingsData : [];
      const tasksList = Array.isArray(tasksData) ? tasksData : [];

      console.log('✅ Processed Meetings:', meetingsList.length);
      console.log('✅ Processed Tasks:', tasksList.length);

      setMeetings(meetingsList);
      setTasks(tasksList);
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setMeetings([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter upcoming meetings (future dates only)
  const upcomingMeetings = meetings
    .filter(m => new Date(m.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  // Filter pending tasks only
  const pendingTasks = tasks
    .filter(t => t.status === 'pending' || t.status === 'in-progress')
    .sort((a, b) => {
      // Sort by due date if available
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    })
    .slice(0, 5);

  console.log('🔍 Upcoming Meetings:', upcomingMeetings.length);
  console.log('🔍 Pending Tasks:', pendingTasks.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative">
      {/* Background Panda */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <Panda success={pendingTasks.length === 0} />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col z-10">
        <h2 className="text-2xl font-bold mb-6">Meeting Assistant</h2>
        <nav className="flex flex-col gap-4 mb-4">
          <Link href="/dashboard" className="text-blue-400 font-semibold">Dashboard</Link>
          <Link href="/meetings" className="hover:text-blue-400 transition">Meetings</Link>
          <Link href="/tasks" className="hover:text-blue-400 transition">Tasks</Link>
          <Link href="/profile" className="hover:text-blue-400 transition">Profile</Link>
        </nav>
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
          <Panda success={pendingTasks.length === 0} />
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-300">Here's what's happening today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Meetings</p>
                <p className="text-3xl font-bold text-white">{meetings.length}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <Calendar size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-white">{tasks.length}</p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <CheckSquare size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending Tasks</p>
                <p className="text-3xl font-bold text-white">{pendingTasks.length}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings and Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meetings */}
          <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Upcoming Meetings</h2>
              <Link href="/meetings" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                View All →
              </Link>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No upcoming meetings</p>
                <Link 
                  href="/meetings" 
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Schedule a meeting
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((m) => (
                  <Link 
                    key={m.id}
                    href={`/meetings/${m.id}`}
                    className="block border border-gray-700 rounded-lg p-4 hover:bg-gray-700 hover:border-gray-600 transition"
                  >
                    <h3 className="font-semibold text-white mb-1">{m.title}</h3>
                    {m.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-1">{m.description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock size={14} className="mr-1" />
                      {format(new Date(m.start_time), 'MMM dd, yyyy - HH:mm')}
                    </div>
                    {m.location && (
                      <p className="text-xs text-gray-500 mt-1">📍 {m.location}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Pending Tasks</h2>
              <Link href="/tasks" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                View All →
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No pending tasks</p>
                <Link 
                  href="/tasks" 
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Create a task
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((t) => (
                  <div 
                    key={t.id} 
                    className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700 hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white flex-1">{t.title}</h3>
                      {t.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          t.priority === 'high' 
                            ? 'bg-red-600 text-white' 
                            : t.priority === 'medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}>
                          {t.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {t.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{t.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      {t.due_date && (
                        <div className={`flex items-center ${
                          new Date(t.due_date) < new Date() 
                            ? 'text-red-400' 
                            : 'text-gray-400'
                        }`}>
                          <AlertCircle size={14} className="mr-1" />
                          Due: {format(new Date(t.due_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                      
                      {t.status === 'in-progress' && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Debug Info (Remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Debug Info:</h3>
            <p className="text-xs text-gray-500">
              Total Meetings: {meetings.length} | Upcoming: {upcomingMeetings.length} | 
              Total Tasks: {tasks.length} | Pending: {pendingTasks.length}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}