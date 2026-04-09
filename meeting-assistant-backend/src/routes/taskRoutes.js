const express = require('express');
const TaskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', TaskController.create);
router.get('/', TaskController.getAll);
router.get('/my-tasks', TaskController.getUserTasks);
router.get('/meeting/:meetingId', TaskController.getMeetingTasks);
router.get('/:id', TaskController.getById);
router.put('/:id', TaskController.update);
router.patch('/:id/status', TaskController.updateStatus);
router.delete('/:id', TaskController.delete);

module.exports = router;