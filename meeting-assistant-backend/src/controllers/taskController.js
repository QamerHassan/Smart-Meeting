const TaskModel = require('../models/taskModel');

class TaskController {
  static async create(req, res) {
    try {
      const taskData = {
        ...req.body,
        created_by: req.userId
      };

      const task = await TaskModel.create(taskData);
      res.status(201).json({ message: 'Task created', task });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  static async getAll(req, res) {
    try {
      const tasks = await TaskModel.getAll();
      res.json({ tasks });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const task = await TaskModel.findById(id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ task });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Failed to get task' });
    }
  }

  static async getUserTasks(req, res) {
    try {
      const tasks = await TaskModel.getByUser(req.userId);
      res.json({ tasks });
    } catch (error) {
      console.error('Get user tasks error:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  static async getMeetingTasks(req, res) {
    try {
      const { meetingId } = req.params;
      const tasks = await TaskModel.getByMeeting(meetingId);
      res.json({ tasks });
    } catch (error) {
      console.error('Get meeting tasks error:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const task = await TaskModel.update(id, req.body);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task updated', task });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await TaskModel.updateStatus(id, status);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task status updated', task });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const task = await TaskModel.delete(id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task deleted' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}

module.exports = TaskController;