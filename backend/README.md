# Component Generator Platform - Backend

A Node.js + Express backend for the AI-driven component generator platform. This backend provides secure authentication, session management, AI integration, and component generation capabilities.

## 🚀 Features

- **Authentication & Security**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Rate limiting and security headers
  - Input validation and sanitization

- **AI Integration**
  - OpenRouter API integration for multiple AI models
  - Component generation with React/JSX
  - Iterative refinement capabilities
  - Chat functionality

- **Session Management**
  - Persistent chat sessions
  - Component versioning
  - Auto-save functionality
  - Session export/import

- **Database**
  - MongoDB with Mongoose ODM
  - Redis for caching and session state
  - Efficient querying and indexing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis (optional, for caching)
- OpenRouter API key

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your actual values:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/component_generator
   MONGODB_DB_NAME=component_generator

   # Redis Configuration (optional)
   REDIS_URL=redis://localhost:6379

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # AI Model Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   AI_MODEL=anthropic/claude-3.5-sonnet

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers (future use)
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── errorHandler.js # Global error handling
│   │   └── requestLogger.js # Request logging
│   ├── models/             # Database models
│   │   ├── User.js         # User model
│   │   └── Session.js      # Session model
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── sessions.js     # Session management
│   │   ├── ai.js           # AI integration
│   │   └── components.js   # Component operations
│   ├── services/           # Business logic
│   │   └── aiService.js    # AI service integration
│   ├── utils/              # Utility functions
│   │   ├── helpers.js      # General helpers
│   │   └── errors.js       # Error handling utilities
│   └── server.js           # Main server file
├── .env                    # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Sessions
- `GET /api/sessions` - Get user's sessions
- `GET /api/sessions/:id` - Get specific session
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `POST /api/sessions/:id/duplicate` - Duplicate session
- `GET /api/sessions/:id/export` - Export session data

### AI Integration
- `POST /api/ai/generate` - Generate new component
- `POST /api/ai/refine` - Refine existing component
- `POST /api/ai/chat` - General chat with AI
- `GET /api/ai/models` - Get available models

### Components
- `GET /api/components/:sessionId/:version` - Get component version
- `GET /api/components/:sessionId/current` - Get current component
- `GET /api/components/:sessionId/versions` - Get all versions
- `POST /api/components/:sessionId/:version/set-current` - Set current version
- `PUT /api/components/:sessionId/:version` - Update component manually
- `GET /api/components/:sessionId/:version/download` - Download as ZIP
- `POST /api/components/:sessionId/:version/duplicate` - Duplicate version

### Health Check
- `GET /health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🤖 AI Models

Supported AI models through OpenRouter:
- `anthropic/claude-3.5-sonnet` (default)
- `openai/gpt-4o-mini`
- `meta-llama/llama-3.1-8b-instruct`
- `google/gemini-2.0-flash-thinking-exp`

## 📊 Data Models

### User Model
```javascript
{
  email: String,
  password: String (hashed),
  name: String,
  avatar: String,
  isVerified: Boolean,
  preferences: {
    theme: String,
    defaultModel: String,
    autoSave: Boolean
  },
  usage: {
    totalSessions: Number,
    totalComponents: Number,
    totalTokens: Number
  }
}
```

### Session Model
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  messages: [MessageSchema],
  components: [ComponentVersionSchema],
  currentComponentVersion: Number,
  status: String,
  tags: [String],
  isPublic: Boolean,
  settings: {
    autoSave: Boolean,
    model: String,
    maxTokens: Number
  },
  statistics: {
    totalMessages: Number,
    totalTokens: Number,
    lastActiveAt: Date
  }
}
```

## 🚦 Running Tests

```bash
# Run setup verification
node test-setup.js

# Run unit tests (when implemented)
npm test
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB_NAME` | Database name | No (default: component_generator) |
| `REDIS_URL` | Redis connection string | No |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | No (default: 7d) |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `AI_MODEL` | Default AI model | No |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |

## 🛡️ Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- MongoDB injection prevention

## 📈 Performance Optimizations

- Database indexing for fast queries
- Redis caching for session state
- Request logging and monitoring
- Efficient pagination
- Connection pooling

## 🐛 Error Handling

The API provides comprehensive error handling with:
- Structured error responses
- Validation error details
- Development vs production error modes
- Graceful shutdown handling

## 📝 Development

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up MongoDB and Redis in production
4. Configure proper CORS settings
5. Use HTTPS in production
6. Set up monitoring and logging

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

For questions or support, please create an issue in the repository.
