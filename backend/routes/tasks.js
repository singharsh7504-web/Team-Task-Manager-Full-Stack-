const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const DeletionHistory = require('../models/DeletionHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Project = require('../models/Project');
const { protect, lead } = require('../middleware/auth');

// @desc   Get all tasks
// @route  GET /api/tasks
router.get('/', protect, async (req, res, next) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;

    if (req.user.role === 'MEMBER') {
      filter.assigneeId = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assigneeId', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// @desc   Create a task
// @route  POST /api/tasks
router.post('/', protect, lead, async (req, res, next) => {
  try {
    const { title, description, projectId, assigneeId, dueDate } = req.body;
    if (!title || !projectId) {
      res.status(400);
      throw new Error('Title and project are required');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const task = await Task.create({
      title, description, projectId, assigneeId, dueDate,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'assigneeId', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'projectId', select: 'name' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// @desc   Update a task (status or details)
// @route  PUT /api/tasks/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Members can only update status of their own tasks
    if (req.user.role === 'MEMBER') {
      if (task.assigneeId?.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this task');
      }
      const previousStatus = task.status;
      task.status = req.body.status || task.status;

      // If task is now COMPLETED, notify the Team Lead
      if (req.body.status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
        const completedCount = await Task.countDocuments({
          assigneeId: req.user._id,
          status: 'COMPLETED',
        });

        const project = await Project.findById(task.projectId);
        if (project) {
          await Notification.create({
            userId: project.teamLeadId,
            message: `${req.user.name} completed task "${task.title}". They have completed ${completedCount + 1} task(s) in total.`,
          });
        }
      }
    } else {
      // Team Lead can update all fields
      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.status = req.body.status || task.status;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.assigneeId = req.body.assigneeId !== undefined ? req.body.assigneeId : task.assigneeId;
    }

    const updated = await task.save();
    const populated = await updated.populate([
      { path: 'assigneeId', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'projectId', select: 'name' },
    ]);
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// @desc   Delete a task (Lead only), record in history
// @route  DELETE /api/tasks/:id
router.delete('/:id', protect, lead, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await DeletionHistory.create({
      taskId: task._id,
      taskTitle: task.title,
      deletedBy: req.user._id,
    });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

// @desc   Get deletion history
// @route  GET /api/tasks/history
router.get('/history', protect, lead, async (req, res, next) => {
  try {
    const history = await DeletionHistory.find()
      .populate('deletedBy', 'name email')
      .sort({ deletedAt: -1 });
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// @desc   Dashboard stats
// @route  GET /api/tasks/stats
router.get('/stats', protect, async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'MEMBER') filter.assigneeId = req.user._id;

    const total = await Task.countDocuments(filter);
    const pending = await Task.countDocuments({ ...filter, status: 'PENDING' });
    const inProgress = await Task.countDocuments({ ...filter, status: 'IN_PROGRESS' });
    const completed = await Task.countDocuments({ ...filter, status: 'COMPLETED' });
    const overdue = await Task.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'COMPLETED' },
    });

    res.json({ total, pending, inProgress, completed, overdue });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
