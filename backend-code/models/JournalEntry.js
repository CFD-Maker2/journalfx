const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entry_date: {
    type: Date,
    default: Date.now
  },
  emotion: {
    type: String,
    enum: ['confident', 'anxious', 'calm', 'stressed', 'excited', 'fearful', 'focused', 'frustrated', 'neutral'],
    default: 'neutral'
  },
  emotion_intensity: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  confidence_level: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  pre_trade: {
    type: String
  },
  during_trade: {
    type: String
  },
  post_trade: {
    type: String
  },
  currency_pair: {
    type: String
  },
  trade_type: {
    type: String,
    enum: ['long', 'short', 'scalp', 'swing', 'day', null]
  },
  market_condition: {
    type: String,
    enum: ['trending', 'ranging', 'volatile', 'calm', null]
  },
  outcome: {
    type: String,
    enum: ['profit', 'loss', 'breakeven', null]
  },
  profit_loss: {
    type: Number
  },
  stop_loss_pips: {
    type: Number
  },
  take_profit_pips: {
    type: Number
  },
  ai_insight: {
    type: String
  },
  sentiment: {
    type: String
  },
  sentiment_score: {
    type: Number
  },
  reflection_prompt: {
    type: String
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
journalEntrySchema.index({ user_id: 1, entry_date: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
