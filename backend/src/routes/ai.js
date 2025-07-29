import express from 'express';
import { body, validationResult } from 'express-validator';
import aiService from '../services/aiService.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/ai/generate
// @desc    Generate a new component
// @access  Private
router.post('/generate', authenticateToken, [
  body('prompt')
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Prompt must be between 5 and 2000 characters'),
  body('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required'),
  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string')
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

    const { prompt, sessionId, model } = req.body;

    // Verify session ownership
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    // Prepare context for AI
    const context = {
      chatHistory: session.messages.slice(-10), // Last 10 messages
      previousComponents: session.components.slice(-3) // Last 3 components
    };

    // Generate component
    const result = await aiService.generateComponent(
      prompt,
      model || session.settings.model,
      context
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate component'
      });
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: prompt,
      metadata: {
        processingTime: Date.now()
      }
    });

    // Add AI response message
    session.messages.push({
      role: 'assistant',
      content: `I've generated a ${result.data.componentName} component for you. ${result.data.description}`,
      metadata: {
        tokens: result.metadata.tokens,
        model: result.metadata.model,
        processingTime: result.metadata.processingTime
      }
    });

    // Add new component version
    const newVersion = session.components.length + 1;
    session.components.push({
      version: newVersion,
      jsx: result.data.jsx,
      css: result.data.css,
      props: result.data.props,
      generationPrompt: prompt,
      metadata: result.metadata
    });

    session.currentComponentVersion = newVersion;

    await session.save();

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'usage.totalComponents': 1,
        'usage.totalTokens': result.metadata.tokens 
      }
    });

    res.json({
      success: true,
      message: 'Component generated successfully',
      data: {
        component: result.data,
        version: newVersion,
        sessionId: session._id
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/refine
// @desc    Refine an existing component
// @access  Private
router.post('/refine', authenticateToken, [
  body('prompt')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Refinement prompt must be between 5 and 1000 characters'),
  body('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required'),
  body('componentVersion')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Component version must be a positive integer'),
  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string')
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

    const { prompt, sessionId, componentVersion, model } = req.body;

    // Get session
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    // Get component to refine
    const versionToRefine = componentVersion || session.currentComponentVersion;
    const originalComponent = session.components.find(c => c.version === versionToRefine);

    if (!originalComponent) {
      return res.status(404).json({
        success: false,
        message: 'Component version not found'
      });
    }

    // Refine component
    const result = await aiService.refineComponent(
      originalComponent,
      prompt,
      model || session.settings.model
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to refine component'
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: prompt,
      metadata: {
        processingTime: Date.now(),
        action: 'refine',
        targetVersion: versionToRefine
      }
    });

    // Add AI response
    session.messages.push({
      role: 'assistant',
      content: `I've refined the component based on your request. ${result.data.description}`,
      metadata: {
        tokens: result.metadata.tokens,
        model: result.metadata.model,
        processingTime: result.metadata.processingTime
      }
    });

    // Add refined component as new version
    const newVersion = session.components.length + 1;
    session.components.push({
      version: newVersion,
      jsx: result.data.jsx,
      css: result.data.css,
      props: result.data.props,
      generationPrompt: `Refinement of v${versionToRefine}: ${prompt}`,
      metadata: result.metadata
    });

    session.currentComponentVersion = newVersion;

    await session.save();

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'usage.totalTokens': result.metadata.tokens 
      }
    });

    res.json({
      success: true,
      message: 'Component refined successfully',
      data: {
        component: result.data,
        version: newVersion,
        sessionId: session._id
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/chat
// @desc    General chat with AI
// @access  Private
router.post('/chat', authenticateToken, [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Session ID must be valid MongoDB ObjectId'),
  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string')
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

    const { message, sessionId, model } = req.body;

    let session = null;
    let context = null;

    // If session ID provided, get context
    if (sessionId) {
      session = await Session.findOne({
        _id: sessionId,
        userId: req.user._id,
        status: 'active'
      });

      if (session) {
        context = {
          chatHistory: session.messages.slice(-5) // Last 5 messages for context
        };
      }
    }

    // Get AI response
    const result = await aiService.chatResponse(
      message,
      context,
      model || req.user.preferences?.defaultModel
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get AI response'
      });
    }

    // If session exists, save the conversation
    if (session) {
      session.messages.push({
        role: 'user',
        content: message,
        metadata: {
          processingTime: Date.now()
        }
      });

      session.messages.push({
        role: 'assistant',
        content: result.data.message,
        metadata: {
          tokens: result.metadata.tokens,
          model: result.metadata.model,
          processingTime: result.metadata.processingTime
        }
      });

      await session.save();

      // Update user token usage
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'usage.totalTokens': result.metadata.tokens }
      });
    }

    res.json({
      success: true,
      data: {
        message: result.data.message,
        sessionId: session?._id
      },
      metadata: result.metadata
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/ai/models
// @desc    Get available AI models
// @access  Private
router.get('/models', authenticateToken, async (req, res, next) => {
  try {
    const result = await aiService.getAvailableModels();

    res.json({
      success: true,
      data: {
        models: result.data,
        default: process.env.AI_MODEL || 'gemini-2.0-flash-lite'
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
