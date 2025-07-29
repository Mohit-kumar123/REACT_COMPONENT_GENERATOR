// Authentication Types
export interface User {
  _id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    defaultModel: string;
    autoSave: boolean;
  };
  usage: {
    componentsGenerated: number;
    sessionsCreated: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Session Types
export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
    action?: string;
  };
}

export interface ComponentVersion {
  version: number;
  jsx: string;
  css: string;
  props: Record<string, any>;
  generationPrompt: string;
  metadata: {
    model: string;
    tokens: number;
    processingTime: number;
  };
  createdAt: string;
  _id: string;
}

export interface Session {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  currentComponentVersion: number;
  status: 'active' | 'archived' | 'deleted';
  tags: string[];
  isPublic: boolean;
  settings: {
    autoSave: boolean;
    model: string;
    maxTokens: number;
  };
  statistics: {
    totalMessages: number;
    totalTokens: number;
    lastActiveAt: string;
  };
  messages: ChatMessage[];
  components: ComponentVersion[];
  createdAt: string;
  updatedAt: string;
}

// AI Types
export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface GenerateComponentRequest {
  prompt: string;
  sessionId: string;
  model?: string;
}

export interface RefineComponentRequest {
  sessionId: string;
  prompt: string;
  componentVersion: number;
}

export interface AIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  metadata?: {
    model: string;
    tokens: number;
    processingTime: number;
  };
}

// Component Preview Types
export interface ComponentPreviewProps {
  jsx: string;
  css: string;
  props?: Record<string, any>;
}

export interface PreviewError {
  message: string;
  line?: number;
  column?: number;
  stack?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  activeTab: 'jsx' | 'css';
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    type: string;
    value: any;
    msg: string;
    path: string;
    location: string;
  }>;
}

// Export Types
export interface ExportData {
  jsx: string;
  css: string;
  props: Record<string, any>;
  componentName: string;
  description?: string;
}
