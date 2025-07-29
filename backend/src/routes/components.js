import express from 'express';
import { body, query, validationResult } from 'express-validator';
import archiver from 'archiver';
import Session from '../models/Session.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/components/:sessionId/:version
// @desc    Get a specific component version
// @access  Private
router.get('/:sessionId/:version', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId, version } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: { $ne: 'deleted' }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const component = session.components.find(c => c.version === parseInt(version));

    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component version not found'
      });
    }

    res.json({
      success: true,
      data: { component }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/components/:sessionId/current
// @desc    Get the current component version
// @access  Private
router.get('/:sessionId/current', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: { $ne: 'deleted' }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const currentComponent = session.components.find(
      c => c.version === session.currentComponentVersion
    );

    if (!currentComponent) {
      return res.status(404).json({
        success: false,
        message: 'No components found in this session'
      });
    }

    res.json({
      success: true,
      data: { component: currentComponent }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/components/:sessionId/versions
// @desc    Get all component versions for a session
// @access  Private
router.get('/:sessionId/versions', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    console.log('Debug - sessionId:', sessionId);
    console.log('Debug - userId:', req.user._id);

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: { $ne: 'deleted' }
    }).select('components currentComponentVersion title');

    console.log('Debug - session found:', !!session);
    if (session) {
      console.log('Debug - components count:', session.components ? session.components.length : 0);
      console.log('Debug - currentVersion:', session.currentComponentVersion);
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if session has any components
    if (!session.components || session.components.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No components found in this session. Generate a component first.',
        debug: {
          sessionId: sessionId,
          componentsCount: session.components ? session.components.length : 0,
          currentVersion: session.currentComponentVersion
        }
      });
    }

    // Return component metadata only (without full code)
    const versions = session.components.map(component => ({
      version: component.version,
      createdAt: component.createdAt,
      generationPrompt: component.generationPrompt,
      metadata: component.metadata
    }));

    res.json({
      success: true,
      data: {
        versions,
        currentVersion: session.currentComponentVersion,
        sessionTitle: session.title
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/components/:sessionId/:version/set-current
// @desc    Set a specific version as current
// @access  Private
router.post('/:sessionId/:version/set-current', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId, version } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const targetVersion = parseInt(version);
    const componentExists = session.components.some(c => c.version === targetVersion);

    if (!componentExists) {
      return res.status(404).json({
        success: false,
        message: 'Component version not found'
      });
    }

    session.currentComponentVersion = targetVersion;
    await session.save();

    res.json({
      success: true,
      message: `Component version ${targetVersion} set as current`,
      data: {
        currentVersion: targetVersion
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/components/:sessionId/:version
// @desc    Update component code manually
// @access  Private
router.put('/:sessionId/:version', authenticateToken, [
  body('jsx')
    .trim()
    .isLength({ min: 10 })
    .withMessage('JSX code is required and must be at least 10 characters'),
  body('css')
    .optional()
    .isString()
    .withMessage('CSS must be a string'),
  body('props')
    .optional()
    .isObject()
    .withMessage('Props must be an object')
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

    const { sessionId, version } = req.params;
    const { jsx, css, props } = req.body;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const targetVersion = parseInt(version);
    const componentIndex = session.components.findIndex(c => c.version === targetVersion);

    if (componentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Component version not found'
      });
    }

    // Update the component
    session.components[componentIndex].jsx = jsx;
    if (css !== undefined) session.components[componentIndex].css = css;
    if (props !== undefined) session.components[componentIndex].props = props;

    // Add a message to chat history
    session.messages.push({
      role: 'user',
      content: `Manually updated component version ${targetVersion}`,
      metadata: {
        action: 'manual_edit',
        targetVersion,
        processingTime: Date.now()
      }
    });

    await session.save();

    res.json({
      success: true,
      message: 'Component updated successfully',
      data: {
        component: session.components[componentIndex]
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/components/:sessionId/:version/download
// @desc    Download component as ZIP file
// @access  Private
router.get('/:sessionId/:version/download', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId, version } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: { $ne: 'deleted' }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const targetVersion = version === 'current' 
      ? session.currentComponentVersion 
      : parseInt(version);

    const component = session.components.find(c => c.version === targetVersion);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component version not found'
      });
    }

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${session.title}-v${targetVersion}.zip"`);

    archive.pipe(res);

    // Extract component name from JSX
    const componentNameMatch = component.jsx.match(/(?:function|const)\s+(\w+)/);
    const componentName = componentNameMatch ? componentNameMatch[1] : 'Component';

    // Add files to archive
    archive.append(component.jsx, { name: `${componentName}.jsx` });
    
    if (component.css) {
      archive.append(component.css, { name: `${componentName}.css` });
    }

    // Add package.json for the component
    const packageJson = {
      name: `${componentName.toLowerCase()}-component`,
      version: '1.0.0',
      description: `Generated React component - ${session.title}`,
      main: `${componentName}.jsx`,
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      },
      keywords: ['react', 'component', 'generated'],
      author: req.user.name
    };

    archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' });

    // Add README
    const readme = `# ${componentName} Component

Generated with Component Generator Platform

## Usage

\`\`\`jsx
import ${componentName} from './${componentName}';

function App() {
  return (
    <div>
      <${componentName} ${Object.keys(component.props || {}).map(key => 
        `${key}={${JSON.stringify(component.props[key])}}`
      ).join(' ')} />
    </div>
  );
}
\`\`\`

## Props

${Object.entries(component.props || {}).map(([key, value]) => 
  `- \`${key}\`: ${typeof value} - Example: \`${JSON.stringify(value)}\``
).join('\n')}

## Generated
- Session: ${session.title}
- Version: ${targetVersion}
- Created: ${component.createdAt}
${component.generationPrompt ? `- Prompt: ${component.generationPrompt}` : ''}
`;

    archive.append(readme, { name: 'README.md' });

    await archive.finalize();

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/components/:sessionId/:version/duplicate
// @desc    Duplicate a component version
// @access  Private
router.post('/:sessionId/:version/duplicate', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId, version } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const targetVersion = parseInt(version);
    const originalComponent = session.components.find(c => c.version === targetVersion);

    if (!originalComponent) {
      return res.status(404).json({
        success: false,
        message: 'Component version not found'
      });
    }

    // Create new version
    const newVersion = session.components.length + 1;
    const duplicatedComponent = {
      version: newVersion,
      jsx: originalComponent.jsx,
      css: originalComponent.css,
      props: originalComponent.props,
      generationPrompt: `Duplicate of v${targetVersion}`,
      metadata: {
        ...originalComponent.metadata,
        duplicatedFrom: targetVersion
      }
    };

    session.components.push(duplicatedComponent);
    session.currentComponentVersion = newVersion;

    // Add message to chat
    session.messages.push({
      role: 'user',
      content: `Duplicated component version ${targetVersion} as version ${newVersion}`,
      metadata: {
        action: 'duplicate',
        sourceVersion: targetVersion,
        newVersion,
        processingTime: Date.now()
      }
    });

    await session.save();

    res.json({
      success: true,
      message: `Component version ${targetVersion} duplicated as version ${newVersion}`,
      data: {
        component: duplicatedComponent,
        newVersion
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
