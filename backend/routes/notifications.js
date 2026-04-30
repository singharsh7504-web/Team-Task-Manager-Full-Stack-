const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc   Get notifications for logged-in user
// @route  GET /api/notifications
router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// @desc   Mark notification as read
// @route  PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      res.status(404);
      throw new Error('Notification not found');
    }
    notif.isRead = true;
    await notif.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// @desc   Mark all notifications as read
// @route  PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
