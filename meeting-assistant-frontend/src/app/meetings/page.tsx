'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { meetingsAPI } from '@/lib/api';
import Panda from '@/app/components/Panda';
import Link from 'next/link';
import { Calendar, Trash2, CheckCircle, Link as LinkIcon, LogOut } from 'lucide-react';

type Meeting = {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  meeting_link?: string;
};

export default function MeetingsPage() {
  const { user, logout } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingsAPI.getMyMeetings();
      console.log('📥 Fetched meetings:', data);
      
      // Handle both array and object responses
      const meetingsList = Array.isArray(data) 
        ? data 
        : ((data as any)?.meetings || []);
      setMeetings(meetingsList);
    } catch (error) {
      console.error('❌ Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      console.log('🗑️ Starting delete for meeting ID:', id);
      console.log('Current meetings count:', meetings.length);
      
      // Call delete API first
      console.log('Calling DELETE API...');
      const response = await meetingsAPI.delete(id);
      console.log('✅ DELETE API returned status:', response.status);
      console.log('Response data:', response.data);
      
      // Force refetch to verify deletion
      console.log('🔄 Verifying deletion from backend...');
      await fetchMeetings();
      
      console.log('✅ Delete and refresh completed');
      
    } catch (error: any) {
      console.error('❌ DELETE FAILED!');
      console.error('Error:', error?.response?.data || error?.message);
      
      const errorMsg = error?.response?.data?.message || 
                       error?.response?.data?.error ||
                       error?.message || 
                       'Could not delete meeting.';
      
      alert(`Delete failed: ${errorMsg}\n\nCheck console for details.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative">
      {/* Background Panda */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Panda success={meetings.length === 0} />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col z-10">
        <h2 className="text-2xl font-bold mb-6">Meeting Assistant</h2>
        <nav className="flex flex-col gap-4 mb-4">
          <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          <Link href="/meetings" className="text-blue-400 font-semibold">Meetings</Link>
          <Link href="/tasks" className="hover:text-blue-400 transition">Tasks</Link>
          <Link href="/profile" className="hover:text-blue-400 transition">Profile</Link>
        </nav>
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 relative z-10">
        {/* Action Panda */}
        <div className="fixed bottom-6 right-6 w-32 h-32 z-20">
          <Panda success={meetings.length > 0} />
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Meetings</h1>
            <p className="text-gray-400 mt-1">{meetings.length} total meetings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-500 transition font-semibold"
          >
            + Create Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-gray-800 p-12 rounded-xl text-center">
            <CheckCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No meetings yet</h3>
            <p className="text-gray-400 mb-4">Start by creating your first meeting</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-500 transition font-semibold"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="bg-gray-800 p-6 rounded-xl flex justify-between items-start border border-gray-700 hover:border-gray-600 hover:shadow-lg transition"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{m.title}</h3>
                  {m.description && <p className="text-gray-400 mb-3">{m.description}</p>}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full">
                      <Calendar size={14} />
                      {new Date(m.start_time).toLocaleString()}
                      {m.end_time && ` - ${new Date(m.end_time).toLocaleTimeString()}`}
                    </span>
                    {m.location && (
                      <span className="bg-gray-700 px-3 py-1 rounded-full">
                        📍 {m.location}
                      </span>
                    )}
                    {m.meeting_link && (
                      <a
                        href={m.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-full transition"
                      >
                        <LinkIcon size={14} />
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-2 text-red-500 hover:bg-red-900/30 rounded-lg transition ml-4"
                  title="Delete meeting"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchMeetings}
        />
      )}
    </div>
  );
}

// Modal Component
function CreateMeetingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    meeting_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const meetingData = {
        ...formData,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : '',
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined,
      };

      console.log('📝 Creating meeting:', meetingData);
      const response = await meetingsAPI.create(meetingData);
      console.log('✅ Meeting created:', response.data);

      // Close modal first
      onClose();
      
      // Then refresh meetings
      await onSuccess();
      
    } catch (error: any) {
      console.error('❌ Failed to create meeting:', error);
      setError(error.response?.data?.message || error.response?.data?.error || 'Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Meeting</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Team Standup"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Meeting agenda and details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g., Conference Room A"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Meeting Link</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 py-3 rounded-lg hover:bg-blue-500 transition font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-600 py-3 rounded-lg hover:bg-gray-500 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}