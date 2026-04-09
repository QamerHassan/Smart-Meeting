'use strict';

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// --------------------
// Config
// --------------------
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// --------------------
// Middleware
// --------------------
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// --------------------
// In-memory stores
// --------------------
const users = new Map(); // email -> { id, name, email, passwordHash }
let userIdCounter = 1;

const tasks = new Map(); // taskId -> task object
let taskIdCounter = 1;

const meetings = new Map(); // meetingId -> meeting object
let meetingIdCounter = 1;

// --------------------
// Auth Routes
// --------------------
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (users.has(email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: userIdCounter++, name, email, passwordHash };
  users.set(email, newUser);

  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.get(email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// --------------------
// Auth middleware
// --------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token missing' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = userData; // { id: userId }
    next();
  });
}

app.get('/auth/me', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ id: user.id, name: user.name, email: user.email });
});

// --------------------
// Tasks Routes
// --------------------
app.get('/tasks', authenticateToken, (req, res) => {
  res.json(Array.from(tasks.values()));
});

app.get('/tasks/my-tasks', authenticateToken, (req, res) => {
  const myTasks = Array.from(tasks.values()).filter(t => t.assignedTo === req.user.id);
  res.json(myTasks);
});

app.get('/tasks/meeting/:meetingId', authenticateToken, (req, res) => {
  const meetingTasks = Array.from(tasks.values()).filter(t => t.meetingId === Number(req.params.meetingId));
  res.json(meetingTasks);
});

app.post('/tasks', authenticateToken, (req, res) => {
  const { title, description, priority, due_date, meeting_id, assigned_to } = req.body;
  const newTask = {
    _id: taskIdCounter++,
    title,
    description,
    status: 'pending',
    priority,
    dueDate: due_date,
    meetingId: meeting_id ? Number(meeting_id) : undefined,
    assignedTo: assigned_to ? Number(assigned_to) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.set(newTask._id, newTask);

  io.emit('task:created', newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
  const task = tasks.get(Number(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });

  Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
  tasks.set(task._id, task);

  io.emit('task:updated', task);
  res.json(task);
});

app.patch('/tasks/:id/status', authenticateToken, (req, res) => {
  const task = tasks.get(Number(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const { status } = req.body;
  task.status = status;
  task.updatedAt = new Date().toISOString();
  tasks.set(task._id, task);

  io.emit('task:updated', task);
  res.json(task);
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
  const task = tasks.get(Number(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });

  tasks.delete(task._id);
  io.emit('task:deleted', task._id);
  res.json({ message: 'Task deleted' });
});

// --------------------
// Meetings Routes
// --------------------
app.get('/meetings', authenticateToken, (req, res) => {
  res.json(Array.from(meetings.values()));
});

app.get('/meetings/my-meetings', authenticateToken, (req, res) => {
  const myMeetings = Array.from(meetings.values()).filter(m => m.participants?.includes(req.user.id));
  res.json(myMeetings);
});

app.get('/meetings/:id', authenticateToken, (req, res) => {
  const meeting = meetings.get(Number(req.params.id));
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
  res.json(meeting);
});

app.post('/meetings', authenticateToken, (req, res) => {
  const { title, description, start_time, end_time, location, meeting_link } = req.body;
  const newMeeting = {
    _id: meetingIdCounter++,
    title,
    description,
    startTime: start_time,
    endTime: end_time,
    location,
    meetingLink: meeting_link,
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  meetings.set(newMeeting._id, newMeeting);

  io.emit('meeting:created', newMeeting);
  res.status(201).json(newMeeting);
});

app.put('/meetings/:id', authenticateToken, (req, res) => {
  const meeting = meetings.get(Number(req.params.id));
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

  Object.assign(meeting, req.body, { updatedAt: new Date().toISOString() });
  meetings.set(meeting._id, meeting);

  io.emit('meeting:updated', meeting);
  res.json(meeting);
});

app.delete('/meetings/:id', authenticateToken, (req, res) => {
  const meeting = meetings.get(Number(req.params.id));
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

  meetings.delete(meeting._id);
  io.emit('meeting:deleted', meeting._id);
  res.json({ message: 'Meeting deleted' });
});

app.post('/meetings/:meetingId/participants', authenticateToken, (req, res) => {
  const meeting = meetings.get(Number(req.params.meetingId));
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

  const { userId } = req.body;
  if (!meeting.participants.includes(userId)) {
    meeting.participants.push(userId);
    meeting.updatedAt = new Date().toISOString();
    meetings.set(meeting._id, meeting);
    io.emit('meeting:updated', meeting);
  }
  res.json(meeting);
});

// --------------------
// Socket.IO
// --------------------
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'], credentials: true },
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on('user:join', (userData) => {
    connectedUsers.set(socket.id, {
      id: userData.userId,
      name: userData.name,
      socketId: socket.id,
    });
    io.emit('users:update', Array.from(connectedUsers.values()));
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`❌ ${user.name} disconnected`);
      connectedUsers.delete(socket.id);
      io.emit('users:update', Array.from(connectedUsers.values()));
    }
  });
});

// --------------------
// Health Check
// --------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', connectedUsers: connectedUsers.size });
});

// --------------------
// Start Server
// --------------------
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
