const express = require('express');
const { body, validationResult } = require('express-validator');
const ReflectionResponse = require('../models/ReflectionResponse');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all reflection responses for user
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    
    const query = { user_id: req.user.userId };
    if (category) query.category = category;

    const responses = await ReflectionResponse.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit));

    res.json(responses);
  } catch (error) {
    console.error('Get reflections error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create reflection response
router.post('/', [
  body('prompt_id').notEmpty(),
  body('prompt_text').notEmpty(),
  body('response').notEmpty(),
  body('category').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reflection = new ReflectionResponse({
      ...req.body,
      user_id: req.user.userId
    });

    await reflection.save();
    res.status(201).json(reflection);
  } catch (error) {
    console.error('Create reflection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update reflection response
router.put('/:id', async (req, res) => {
  try {
    const reflection = await ReflectionResponse.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.userId },
      { response: req.body.response },
      { new: true, runValidators: true }
    );

    if (!reflection) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    res.json(reflection);
  } catch (error) {
    console.error('Update reflection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete reflection response
router.delete('/:id', async (req, res) => {
  try {
    const reflection = await ReflectionResponse.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.userId
    });

    if (!reflection) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    res.json({ message: 'Reflection deleted successfully' });
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
