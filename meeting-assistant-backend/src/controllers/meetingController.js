const MeetingModel = require('../models/meetingModel');

class MeetingController {
  static async create(req, res) {
    try {
      const meetingData = {
        ...req.body,
        created_by: req.userId
      };

      const meeting = await MeetingModel.create(meetingData);
      res.status(201).json({ message: 'Meeting created', meeting });
    } catch (error) {
      console.error('Create meeting error:', error);
      res.status(500).json({ error: 'Failed to create meeting' });
    }
  }

  static async getAll(req, res) {
    try {
      const meetings = await MeetingModel.getAll();
      res.json({ meetings });
    } catch (error) {
      console.error('Get meetings error:', error);
      res.status(500).json({ error: 'Failed to get meetings' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const meeting = await MeetingModel.findById(id);
      
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const participants = await MeetingModel.getParticipants(id);
      
      res.json({ meeting: { ...meeting, participants } });
    } catch (error) {
      console.error('Get meeting error:', error);
      res.status(500).json({ error: 'Failed to get meeting' });
    }
  }

  static async getUserMeetings(req, res) {
    try {
      const meetings = await MeetingModel.getByUser(req.userId);
      res.json({ meetings });
    } catch (error) {
      console.error('Get user meetings error:', error);
      res.status(500).json({ error: 'Failed to get meetings' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const meeting = await MeetingModel.update(id, req.body);
      
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      res.json({ message: 'Meeting updated', meeting });
    } catch (error) {
      console.error('Update meeting error:', error);
      res.status(500).json({ error: 'Failed to update meeting' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const meeting = await MeetingModel.delete(id);
      
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      res.json({ message: 'Meeting deleted' });
    } catch (error) {
      console.error('Delete meeting error:', error);
      res.status(500).json({ error: 'Failed to delete meeting' });
    }
  }

  static async addParticipant(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      await MeetingModel.addParticipant(id, userId);
      res.json({ message: 'Participant added' });
    } catch (error) {
      console.error('Add participant error:', error);
      res.status(500).json({ error: 'Failed to add participant' });
    }
  }
}

module.exports = MeetingController;