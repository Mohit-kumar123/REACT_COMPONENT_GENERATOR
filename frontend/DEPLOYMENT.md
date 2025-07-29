# AI Component Generator - Frontend

A modern Next.js 14+ frontend for AI-driven React component generation with authentication, real-time chat, and component preview.

## 🚀 Live Demo

**Frontend:** *Will be deployed to Vercel*  
**Backend API:** https://ai-component-generator-backend-18mr.onrender.com

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn/ui (Slate theme)
- **State Management:** Zustand with persistence
- **Authentication:** JWT-based with secure session management
- **API Client:** Axios with interceptors
- **Icons:** Lucide React
- **Deployment:** Vercel

## ✨ Features

### ✅ Implemented
- 🔐 **Authentication System** - Login/Register with JWT
- 🏠 **Dashboard** - User dashboard with session management
- 🎨 **Dark Theme UI** - Professional design with Shadcn/ui
- 🛡️ **Protected Routes** - Authentication guards
- 💾 **State Persistence** - Auto-save with Zustand
- 🔗 **API Integration** - Full backend connectivity
- 📱 **Responsive Design** - Mobile-first approach

### 🚧 Next Phase
- 💬 **Chat Interface** - AI conversation for component generation
- 🖥️ **Code Editor** - Monaco Editor for code editing
- 👁️ **Live Preview** - Iframe sandbox for component preview
- 📥 **Export System** - Download generated components

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard area
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (Header, Sidebar)
│   └── ui/                # Shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # API service layer
├── store/                 # Zustand state stores
├── types/                 # TypeScript type definitions
└── utils/                 # Helper utilities
```

## 🚀 Quick Deploy to Vercel

1. **Connect to Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Or Deploy via GitHub:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import from GitHub: `https://github.com/Mohit-kumar123/REACT_COMPONENT_GENERATOR`
   - Select the `frontend` folder as root directory
   - Deploy!

## ⚙️ Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_API_URL=https://ai-component-generator-backend-18mr.onrender.com
```

For Vercel deployment, add this environment variable in the Vercel dashboard.

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📋 Deployment Checklist

- ✅ All code pushed to GitHub
- ✅ Environment variables configured
- ✅ Backend API integration ready
- ✅ Build process verified
- 🔲 Deploy to Vercel
- 🔲 Configure custom domain (optional)
- 🔲 Set up monitoring

## 🔗 Related Links

- **Backend Repository:** Same repo, `/backend` folder
- **API Documentation:** Available in backend README
- **Design System:** Shadcn/ui with Slate theme
- **Deployment Platform:** Vercel

## 📞 Support

For issues or questions, refer to the main project README or create an issue in the repository.

---

**Status:** ✅ Ready for Production Deployment  
**Last Updated:** July 29, 2025
