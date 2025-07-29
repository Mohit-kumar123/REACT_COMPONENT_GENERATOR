import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Session, ComponentVersion, ChatMessage } from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (token: string, user: User) => {
        localStorage.setItem('auth_token', token);
        set({ token, user, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Session Store
interface SessionState {
  currentSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  setCurrentSession: (session: Session | null) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  removeSession: (sessionId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      isLoading: false,
      
      setCurrentSession: (session: Session | null) => {
        set({ currentSession: session });
      },
      
      setSessions: (sessions: Session[]) => {
        set({ sessions });
      },
      
      addSession: (session: Session) => {
        const sessions = get().sessions;
        set({ sessions: [session, ...sessions] });
      },
      
      updateSession: (sessionId: string, updates: Partial<Session>) => {
        const sessions = get().sessions;
        const currentSession = get().currentSession;
        
        const updatedSessions = sessions.map(session => 
          session._id === sessionId ? { ...session, ...updates } : session
        );
        
        const updatedCurrentSession = currentSession?._id === sessionId 
          ? { ...currentSession, ...updates } 
          : currentSession;
        
        set({ 
          sessions: updatedSessions, 
          currentSession: updatedCurrentSession 
        });
      },
      
      removeSession: (sessionId: string) => {
        const sessions = get().sessions;
        const currentSession = get().currentSession;
        
        const filteredSessions = sessions.filter(session => session._id !== sessionId);
        const newCurrentSession = currentSession?._id === sessionId ? null : currentSession;
        
        set({ 
          sessions: filteredSessions, 
          currentSession: newCurrentSession 
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentSession: state.currentSession,
        sessions: state.sessions 
      }),
    }
  )
);

// Component Store
interface ComponentState {
  currentComponent: ComponentVersion | null;
  versions: Array<{
    version: number;
    createdAt: string;
    generationPrompt: string;
    metadata: ComponentVersion['metadata'];
  }>;
  currentVersion: number;
  isPreviewMode: boolean;
  activeTab: 'jsx' | 'css' | 'preview';
  setCurrentComponent: (component: ComponentVersion | null) => void;
  setVersions: (versions: ComponentState['versions']) => void;
  setCurrentVersion: (version: number) => void;
  setPreviewMode: (isPreview: boolean) => void;
  setActiveTab: (tab: ComponentState['activeTab']) => void;
  updateComponentCode: (jsx: string, css?: string) => void;
}

export const useComponentStore = create<ComponentState>()(
  persist(
    (set, get) => ({
      currentComponent: null,
      versions: [],
      currentVersion: 1,
      isPreviewMode: false,
      activeTab: 'jsx',
      
      setCurrentComponent: (component: ComponentVersion | null) => {
        set({ currentComponent: component });
      },
      
      setVersions: (versions: ComponentState['versions']) => {
        set({ versions });
      },
      
      setCurrentVersion: (version: number) => {
        set({ currentVersion: version });
      },
      
      setPreviewMode: (isPreview: boolean) => {
        set({ isPreviewMode: isPreview });
      },
      
      setActiveTab: (tab: ComponentState['activeTab']) => {
        set({ activeTab: tab });
      },
      
      updateComponentCode: (jsx: string, css?: string) => {
        const currentComponent = get().currentComponent;
        if (currentComponent) {
          const updatedComponent = {
            ...currentComponent,
            jsx,
            css: css || currentComponent.css
          };
          set({ currentComponent: updatedComponent });
        }
      },
    }),
    {
      name: 'component-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentVersion: state.currentVersion,
        activeTab: state.activeTab,
        isPreviewMode: state.isPreviewMode
      }),
    }
  )
);

// Chat Store
interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isGenerating: boolean;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setTyping: (isTyping: boolean) => void;
  setGenerating: (isGenerating: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      isGenerating: false,
      
      addMessage: (message: ChatMessage) => {
        const messages = get().messages;
        set({ messages: [...messages, message] });
      },
      
      setMessages: (messages: ChatMessage[]) => {
        set({ messages });
      },
      
      setTyping: (isTyping: boolean) => {
        set({ isTyping });
      },
      
      setGenerating: (isGenerating: boolean) => {
        set({ isGenerating });
      },
      
      clearMessages: () => {
        set({ messages: [] });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);

// UI Store for general UI state
interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  isOnline: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setOnline: (isOnline: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isSidebarOpen: true,
      theme: 'dark',
      isOnline: true,
      
      toggleSidebar: () => {
        const isSidebarOpen = get().isSidebarOpen;
        set({ isSidebarOpen: !isSidebarOpen });
      },
      
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        // Apply theme to document
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      
      setOnline: (isOnline: boolean) => {
        set({ isOnline });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme 
      }),
    }
  )
);
