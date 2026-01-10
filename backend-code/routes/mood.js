const express = require('express');
const { body, validationResult } = require('express-validator');
const MoodLog = require('../models/MoodLog');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all mood logs for user
router.get('/', async (req, res) => {
  try {
    const { limit = 50, startDate, endDate } = req.query;
    
    const query = { user_id: req.user.userId };
    
    if (startDate || endDate) {
      query.log_date = {};
      if (startDate) query.log_date.$gte = new Date(startDate);
      if (endDate) query.log_date.$lte = new Date(endDate);
    }

    const logs = await MoodLog.find(query)
      .sort({ log_date: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    console.error('Get mood logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create mood log
router.post('/', [
  body('emotion').isIn(['confident', 'anxious', 'calm', 'stressed', 'excited', 'fearful', 'focused', 'frustrated', 'neutral']),
  body('intensity').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const log = new MoodLog({
      ...req.body,
      user_id: req.user.userId
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    console.error('Create mood log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update mood log
router.put('/:id', async (req, res) => {
  try {
    const log = await MoodLog.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({ error: 'Mood log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Update mood log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete mood log
router.delete('/:id', async (req, res) => {
  try {
    const log = await MoodLog.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.userId
    });

    if (!log) {
      return res.status(404).json({ error: 'Mood log not found' });
    }

    res.json({ message: 'Mood log deleted successfully' });
  } catch (error) {
    console.error('Delete mood log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get weekly mood summary
router.get('/stats/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const stats = await MoodLog.aggregate([
      {
        $match: {
          user_id: req.user.userId,
          log_date: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$intensity' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
