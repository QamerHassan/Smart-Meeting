// ============================================
// FILE: src/lib/mockDatabase.ts
// In-memory storage for meetings and tasks (singleton pattern)
// ============================================

type Meeting = {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  meeting_link?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at?: string;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  meeting_id?: number;
  assigned_to?: string;
  status: 'pending' | 'completed' | 'in-progress' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at?: string;
};

// Global singleton to prevent multiple instances
declare global {
  var meetingsDB: Meeting[] | undefined;
  var tasksDB: Task[] | undefined;
  var nextMeetingId: number | undefined;
  var nextTaskId: number | undefined;
}

// Initialize or reuse existing
if (!global.meetingsDB) {
  global.meetingsDB = [];
  global.nextMeetingId = 1;
  console.log('🔧 Initialized new meetings database');
}

if (!global.tasksDB) {
  global.tasksDB = [];
  global.nextTaskId = 1;
  console.log('🔧 Initialized new tasks database');
}

const meetingsDB = global.meetingsDB;
const tasksDB = global.tasksDB;
let nextMeetingId = global.nextMeetingId || 1;
let nextTaskId = global.nextTaskId || 1;

export const mockDatabase = {
  // ==================== MEETINGS ====================
  
  getAllMeetings: () => {
    console.log('📋 Getting all meetings, count:', meetingsDB.length);
    return [...meetingsDB];
  },

  getMeetingsByUser: (userId: string) => {
    return meetingsDB.filter(m => m.created_by === userId);
  },

  getMeetingById: (id: number) => {
    const meeting = meetingsDB.find(m => m.id === id);
    console.log('🔍 Get meeting by ID:', id, 'Found:', !!meeting);
    return meeting;
  },

  createMeeting: (data: Omit<Meeting, 'id' | 'created_at'>) => {
    const newMeeting: Meeting = {
      id: nextMeetingId++,
      ...data,
      status: data.status || 'scheduled',
      created_at: new Date().toISOString(),
    };
    
    meetingsDB.push(newMeeting);
    global.nextMeetingId = nextMeetingId;
    
    console.log('✅ Meeting created in DB:', newMeeting.id);
    console.log('📊 Total meetings in DB:', meetingsDB.length);
    return newMeeting;
  },

  updateMeeting: (id: number, data: Partial<Meeting>) => {
    const index = meetingsDB.findIndex(m => m.id === id);
    if (index === -1) {
      console.log('❌ Meeting not found for update:', id);
      return null;
    }
    
    meetingsDB[index] = {
      ...meetingsDB[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    console.log('✅ Meeting updated in DB:', meetingsDB[index].id);
    return meetingsDB[index];
  },

  deleteMeeting: (id: number) => {
    console.log('🗑️ Attempting to delete meeting:', id);
    console.log('📊 Meetings before delete:', meetingsDB.map(m => m.id));
    
    const index = meetingsDB.findIndex(m => m.id === id);
    
    if (index === -1) {
      console.log('❌ Meeting not found in DB for deletion:', id);
      return false;
    }
    
    const deleted = meetingsDB.splice(index, 1)[0];
    console.log('✅ Meeting deleted from DB:', deleted.id, deleted.title);
    console.log('📊 Remaining meetings:', meetingsDB.length);
    
    return true;
  },

  // ==================== TASKS ====================

  getAllTasks: () => {
    console.log('📋 Getting all tasks, count:', tasksDB.length);
    return [...tasksDB];
  },

  getTasksByUser: (userId: string) => {
    return tasksDB.filter(t => t.created_by === userId);
  },

  getTaskById: (id: number) => {
    const task = tasksDB.find(t => t.id === id);
    console.log('🔍 Get task by ID:', id, 'Found:', !!task);
    return task;
  },

  getTasksByMeeting: (meetingId: number) => {
    return tasksDB.filter(t => t.meeting_id === meetingId);
  },

  createTask: (data: Omit<Task, 'id' | 'created_at'>) => {
    const newTask: Task = {
      id: nextTaskId++,
      ...data,
      status: data.status || 'pending',
      created_at: new Date().toISOString(),
    };
    
    tasksDB.push(newTask);
    global.nextTaskId = nextTaskId;
    
    console.log('✅ Task created in DB:', newTask.id);
    console.log('📊 Total tasks in DB:', tasksDB.length);
    return newTask;
  },

  updateTask: (id: number, data: Partial<Task>) => {
    const index = tasksDB.findIndex(t => t.id === id);
    if (index === -1) {
      console.log('❌ Task not found for update:', id);
      return null;
    }
    
    tasksDB[index] = {
      ...tasksDB[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    console.log('✅ Task updated in DB:', tasksDB[index].id);
    return tasksDB[index];
  },

  // ✅ DELETE METHOD ALREADY EXISTS AND IS CORRECT
  deleteTask: (id: number) => {
    console.log('🗑️ Attempting to delete task:', id);
    console.log('📊 Tasks before delete:', tasksDB.map(t => t.id));
    
    const index = tasksDB.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.log('❌ Task not found in DB for deletion:', id);
      return false;
    }
    
    const deleted = tasksDB.splice(index, 1)[0];
    console.log('✅ Task deleted from DB:', deleted.id, deleted.title);
    console.log('📊 Remaining tasks:', tasksDB.length);
    
    return true;
  },

  // ==================== DEBUG ====================

  debug: () => {
    const meetings = meetingsDB.map(m => ({ id: m.id, title: m.title }));
    const tasks = tasksDB.map(t => ({ id: t.id, title: t.title }));
    console.log('🐛 Debug - Meetings:', meetings);
    console.log('🐛 Debug - Tasks:', tasks);
    return { meetings, tasks };
  }
};