const mongoose = require('mongoose');

const deletionHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  taskTitle: {
    type: String,
    required: true,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

const DeletionHistory = mongoose.model('DeletionHistory', deletionHistorySchema);
module.exports = DeletionHistory;
