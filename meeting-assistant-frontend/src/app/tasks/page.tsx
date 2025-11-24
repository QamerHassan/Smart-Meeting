'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tasksAPI } from '@/lib/api';
import Panda from '@/app/components/Panda';
import { CheckSquare, Plus, Calendar, AlertCircle, Trash2, Check, LogOut, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

type Task = {
  id: number;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'in-progress' | 'cancelled';
  due_date?: string;
  meeting_id?: number;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
};

export default function TasksPage() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'in-progress'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getMyTasks();
      console.log('✅ Fetched tasks:', data);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: Task['status']) => {
    try {
      await tasksAPI.updateStatus(id, newStatus);
      setTasks(tasks.map(task => (task.id === id ? { ...task, status: newStatus } : task)));
      console.log('✅ Task status updated:', id, newStatus);
    } catch (error) {
      console.error('❌ Error updating task:', error);
      alert('Failed to update task status');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(id);
        setTasks(tasks.filter(t => t.id !== id));
        console.log('✅ Task deleted:', id);
      } catch (error) {
        console.error('❌ Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Sort tasks: pending/in-progress first, then by due date, then by priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    // Sort by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    return aPriority - bPriority;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white relative">
      {/* Background Panda */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Panda success={completedCount > 0} />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col z-10">
        <h2 className="text-2xl font-bold mb-6">Meeting Assistant</h2>
        <nav className="flex flex-col gap-4 mb-4">
          <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          <Link href="/meetings" className="hover:text-blue-400 transition">Meetings</Link>
          <Link href="/tasks" className="text-blue-400 font-semibold">Tasks</Link>
          <Link href="/profile" className="hover:text-blue-400 transition">Profile</Link>
        </nav>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 relative z-10">
        {/* Action Panda */}
        <div className="fixed bottom-6 right-6 w-32 h-32 z-20">
          <Panda success={completedCount > 0} />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className="text-gray-400">
              {tasks.length} total tasks • {pendingCount} pending • {inProgressCount} in progress • {completedCount} completed
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition flex items-center space-x-2 font-semibold"
          >
            <Plus size={20} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Task List */}
        {sortedTasks.length === 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <CheckSquare size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' ? 'Get started by creating your first task' : `You have no ${filter} tasks`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition font-semibold"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map(task => (
              <div
                key={task.id}
                className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700 hover:border-gray-600 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Status Toggle */}
                    <div className="flex flex-col gap-2 mt-1">
                      <button
                        onClick={() =>
                          handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')
                        }
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-600 hover:border-blue-500'
                        }`}
                        title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {task.status === 'completed' && <Check size={16} className="text-white" />}
                      </button>
                      
                      {task.status !== 'completed' && (
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, task.status === 'in-progress' ? 'pending' : 'in-progress')
                          }
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                            task.status === 'in-progress'
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-600 hover:border-yellow-500'
                          }`}
                          title={task.status === 'in-progress' ? 'Mark as pending' : 'Mark as in progress'}
                        >
                          {task.status === 'in-progress' && <Clock size={16} className="text-white" />}
                        </button>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold mb-1 ${
                          task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        {task.priority && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.priority === 'high'
                                ? 'bg-red-600 text-white'
                                : task.priority === 'medium'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-green-600 text-white'
                            }`}
                          >
                            {task.priority.toUpperCase()} PRIORITY
                          </span>
                        )}

                        {task.status === 'in-progress' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                            IN PROGRESS
                          </span>
                        )}

                        {task.status === 'completed' && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                            ✓ COMPLETED
                          </span>
                        )}

                        {task.due_date && (
                          <span className={`flex items-center px-3 py-1 rounded-full ${
                            new Date(task.due_date) < new Date() && task.status !== 'completed'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            <AlertCircle size={14} className="mr-1" />
                            Due: {format(new Date(task.due_date), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-500 hover:bg-red-900/30 rounded-lg transition ml-4"
                    title="Delete task"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  );
}

// Create Task Modal
function CreateTaskModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<{
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    status?: 'pending' | 'in-progress';
  }>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: 'pending',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare task data
      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        priority: formData.priority,
        status: formData.status || 'pending',
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      };

      console.log('📝 Creating task:', taskData);
      
      const response = await tasksAPI.create(taskData);
      console.log('✅ Task created:', response);
      
      // Refresh tasks list
      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error creating task:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Task</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Prepare presentation slides"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={e =>
                setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
              }
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Initial Status</label>
            <select
              value={formData.status}
              onChange={e =>
                setFormData({ ...formData, status: e.target.value as 'pending' | 'in-progress' })
              }
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date (Optional)</label>
            <input
              type="datetime-local"
              value={formData.due_date}
              onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 py-3 rounded-lg hover:bg-blue-500 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Creating...' : 'Create Task'}
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