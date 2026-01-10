const mongoose = require('mongoose');

const reflectionResponseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt_id: {
    type: String,
    required: true
  },
  prompt_text: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
reflectionResponseSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('ReflectionResponse', reflectionResponseSchema);
