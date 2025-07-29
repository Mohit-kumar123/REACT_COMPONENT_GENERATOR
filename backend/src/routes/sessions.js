import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get user's sessions
// @access  Private
router.get('/', authenticateToken, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'archived', 'deleted'])
    .withMessage('Status must be active, archived, or deleted'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'active';
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Build query
    const query = {
      userId: req.user._id,
      status
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get sessions with pagination
    const [sessions, total] = await Promise.all([
      Session.find(query)
        .select('-messages -components') // Exclude large fields for list view
        .sort({ 'statistics.lastActiveAt': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalSessions: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session
// @access  Private
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $ne: 'deleted' }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, tags, settings } = req.body;

    const session = new Session({
      userId: req.user._id,
      title,
      description: description || '',
      tags: tags || [],
      settings: {
        autoSave: settings?.autoSave ?? true,
        model: settings?.model || req.user.preferences?.defaultModel || 'gemini-2.0-flash-lite',
        maxTokens: settings?.maxTokens || 4096
      }
    });

    await session.save();

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'usage.totalSessions': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update a session
// @access  Private
router.put('/:id', authenticateToken, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['active', 'archived'])
    .withMessage('Status must be active or archived'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, tags, status, isPublic, settings } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;
    if (typeof isPublic === 'boolean') updateData.isPublic = isPublic;
    if (settings) {
      if (settings.autoSave !== undefined) updateData['settings.autoSave'] = settings.autoSave;
      if (settings.model) updateData['settings.model'] = settings.model;
      if (settings.maxTokens) updateData['settings.maxTokens'] = settings.maxTokens;
    }

    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        status: { $ne: 'deleted' }
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a session (soft delete)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        status: { $ne: 'deleted' }
      },
      { status: 'deleted' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sessions/:id/duplicate
// @desc    Duplicate a session
// @access  Private
router.post('/:id/duplicate', authenticateToken, async (req, res, next) => {
  try {
    const originalSession = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $ne: 'deleted' }
    });

    if (!originalSession) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const duplicatedSession = new Session({
      userId: req.user._id,
      title: `${originalSession.title} (Copy)`,
      description: originalSession.description,
      messages: originalSession.messages,
      components: originalSession.components,
      currentComponentVersion: originalSession.currentComponentVersion,
      tags: originalSession.tags,
      settings: originalSession.settings
    });

    await duplicatedSession.save();

    res.status(201).json({
      success: true,
      message: 'Session duplicated successfully',
      data: { session: duplicatedSession }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/sessions/:id/export
// @desc    Export session data
// @access  Private
router.get('/:id/export', authenticateToken, async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $ne: 'deleted' }
    }).populate('userId', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const exportData = {
      sessionInfo: {
        title: session.title,
        description: session.description,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        tags: session.tags,
        statistics: session.statistics
      },
      chatHistory: session.messages,
      components: session.components,
      settings: session.settings
    };

    res.json({
      success: true,
      data: { exportData }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
