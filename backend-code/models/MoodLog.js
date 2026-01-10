const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  log_date: {
    type: Date,
    default: Date.now
  },
  emotion: {
    type: String,
    enum: ['confident', 'anxious', 'calm', 'stressed', 'excited', 'fearful', 'focused', 'frustrated', 'neutral'],
    required: true
  },
  intensity: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  notes: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
moodLogSchema.index({ user_id: 1, log_date: -1 });

module.exports = mongoose.model('MoodLog', moodLogSchema);
