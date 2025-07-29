# AI Component Generator Platform

A full-stack platform for generating React components using AI, built with Node.js backend and Next.js frontend.

## 🚀 Features

- **AI-Powered Component Generation** using Google Gemini
- **User Authentication** with JWT
- **Session Management** with chat history
- **Component Versioning** and refinement
- **Real-time Chat Interface**
- **Component Export** as ZIP files
- **Responsive Design** for all devices

## 📁 Project Structure

```
Project/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── frontend/               # Next.js + React (Coming Soon)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API services
│   └── package.json
│
└── docs/                   # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Cache:** Redis Cloud
- **Authentication:** JWT + bcrypt
- **AI:** Google Gemini API

### Frontend (Coming Soon)
- **Framework:** Next.js 14+
- **UI Library:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand
- **Code Editor:** Monaco Editor

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📖 API Documentation

The backend provides a RESTful API with the following endpoints:

- **Authentication:** `/api/auth/*`
- **Sessions:** `/api/sessions/*`
- **AI Operations:** `/api/ai/*`
- **Components:** `/api/components/*`
- **Health Check:** `/health`

## 🌐 Live Demo

- **Backend API:** [Deployed on Render]
- **Frontend App:** [Coming Soon]

## 📝 License

MIT License - see LICENSE file for details.

## 👨‍💻 Author

Mohit Kumar (@Mohit-kumar123)
