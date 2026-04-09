'use client';

import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export interface Task {
  _id: string | number;
  title: string;
  description?: string;
  meetingId?: string | number;
  assignedTo?: string | number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseRealTimeTasksProps {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string | number) => void;
}

export const useRealTimeTasks = ({
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}: UseRealTimeTasksProps = {}) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // ----------------------------
    // Event Handlers
    // ----------------------------
    const handleCreated = (task: any) => {
      if (!task.status) task.status = 'pending';
      onTaskCreated?.(task);
    };

    const handleUpdated = (task: any) => {
      if (!task.status) task.status = 'pending';
      onTaskUpdated?.(task);
    };

    const handleDeleted = (taskId: string | number) => {
      onTaskDeleted?.(taskId);
    };

    // ----------------------------
    // Register socket events
    // ----------------------------
    if (onTaskCreated) socket.on('task:created', handleCreated);
    if (onTaskUpdated) socket.on('task:updated', handleUpdated);
    if (onTaskDeleted) socket.on('task:deleted', handleDeleted);

    // ----------------------------
    // Cleanup on unmount
    // ----------------------------
    return () => {
      if (onTaskCreated) socket.off('task:created', handleCreated);
      if (onTaskUpdated) socket.off('task:updated', handleUpdated);
      if (onTaskDeleted) socket.off('task:deleted', handleDeleted);
    };
  }, [socket, isConnected, onTaskCreated, onTaskUpdated, onTaskDeleted]);

  return { isConnected };
};
