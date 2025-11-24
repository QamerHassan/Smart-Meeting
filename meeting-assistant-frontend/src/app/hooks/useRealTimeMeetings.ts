'use client';

import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export interface Meeting {
  _id: string | number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  participants?: (string | number)[];
  createdAt: string;
  updatedAt: string;
}

interface UseRealTimeMeetingsProps {
  onMeetingCreated?: (meeting: Meeting) => void;
  onMeetingUpdated?: (meeting: Meeting) => void;
  onMeetingDeleted?: (meetingId: string | number) => void;
}

export const useRealTimeMeetings = ({
  onMeetingCreated,
  onMeetingUpdated,
  onMeetingDeleted,
}: UseRealTimeMeetingsProps = {}) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // ----------------------------
    // Event Handlers
    // ----------------------------
    const handleCreated = (meeting: any) => {
      if (!meeting.status) meeting.status = 'scheduled';
      onMeetingCreated?.(meeting);
    };

    const handleUpdated = (meeting: any) => {
      if (!meeting.status) meeting.status = 'scheduled';
      onMeetingUpdated?.(meeting);
    };

    const handleDeleted = (meetingId: string | number) => {
      onMeetingDeleted?.(meetingId);
    };

    // ----------------------------
    // Register socket events
    // ----------------------------
    if (onMeetingCreated) socket.on('meeting:created', handleCreated);
    if (onMeetingUpdated) socket.on('meeting:updated', handleUpdated);
    if (onMeetingDeleted) socket.on('meeting:deleted', handleDeleted);

    // ----------------------------
    // Cleanup
    // ----------------------------
    return () => {
      if (onMeetingCreated) socket.off('meeting:created', handleCreated);
      if (onMeetingUpdated) socket.off('meeting:updated', handleUpdated);
      if (onMeetingDeleted) socket.off('meeting:deleted', handleDeleted);
    };
  }, [socket, isConnected, onMeetingCreated, onMeetingUpdated, onMeetingDeleted]);

  return { isConnected };
};
