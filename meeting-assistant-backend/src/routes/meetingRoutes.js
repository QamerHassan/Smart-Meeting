const express = require('express');
const MeetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', MeetingController.create);
router.get('/', MeetingController.getAll);
router.get('/my-meetings', MeetingController.getUserMeetings);
router.get('/:id', MeetingController.getById);
router.put('/:id', MeetingController.update);
router.delete('/:id', MeetingController.delete);
router.post('/:id/participants', MeetingController.addParticipant);

module.exports = router;