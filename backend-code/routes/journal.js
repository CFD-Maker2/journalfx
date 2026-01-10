const express = require('express');
const { body, validationResult } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all journal entries for user
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const query = { user_id: req.user.userId };
    
    if (startDate || endDate) {
      query.entry_date = {};
      if (startDate) query.entry_date.$gte = new Date(startDate);
      if (endDate) query.entry_date.$lte = new Date(endDate);
    }

    const entries = await JournalEntry.find(query)
      .sort({ entry_date: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await JournalEntry.countDocuments(query);

    res.json({ entries, total });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single journal entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user_id: req.user.userId
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create journal entry
router.post('/', [
  body('emotion').isIn(['confident', 'anxious', 'calm', 'stressed', 'excited', 'fearful', 'focused', 'frustrated', 'neutral']),
  body('emotion_intensity').optional().isInt({ min: 1, max: 5 }),
  body('confidence_level').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entry = new JournalEntry({
      ...req.body,
      user_id: req.user.userId
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update journal entry
router.put('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.userId },
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete journal entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.userId
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await JournalEntry.aggregate([
      { $match: { user_id: req.user.userId } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          avgConfidence: { $avg: '$confidence_level' },
          avgEmotionIntensity: { $avg: '$emotion_intensity' },
          totalProfit: {
            $sum: {
              $cond: [{ $eq: ['$outcome', 'profit'] }, '$profit_loss', 0]
            }
          },
          wins: {
            $sum: { $cond: [{ $eq: ['$outcome', 'profit'] }, 1, 0] }
          },
          losses: {
            $sum: { $cond: [{ $eq: ['$outcome', 'loss'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalEntries: 0,
      avgConfidence: 0,
      avgEmotionIntensity: 0,
      totalProfit: 0,
      wins: 0,
      losses: 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
