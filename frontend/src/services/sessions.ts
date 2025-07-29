import { apiCall } from './api';
import { Session, ChatMessage } from '@/types';

export const sessionService = {
  // Get all sessions
  getSessions: async (page = 1, limit = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiCall<{
      sessions: Session[];
      totalPages: number;
      currentPage: number;
      totalSessions: number;
    }>('GET', `/api/sessions?${params}`);
  },

  // Get session by ID
  getSession: async (sessionId: string) => {
    return apiCall<{ session: Session }>('GET', `/api/sessions/${sessionId}`);
  },

  // Create new session
  createSession: async (data: {
    title: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    return apiCall<{ session: Session }>('POST', '/api/sessions', data);
  },

  // Update session
  updateSession: async (sessionId: string, data: {
    title?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    settings?: Session['settings'];
  }) => {
    return apiCall<{ session: Session }>('PUT', `/api/sessions/${sessionId}`, data);
  },

  // Delete session
  deleteSession: async (sessionId: string) => {
    return apiCall('DELETE', `/api/sessions/${sessionId}`);
  },

  // Duplicate session
  duplicateSession: async (sessionId: string, title: string) => {
    return apiCall<{ session: Session }>('POST', `/api/sessions/${sessionId}/duplicate`, { title });
  },

  // Export session
  exportSession: async (sessionId: string, format: 'json' | 'markdown' = 'json') => {
    return apiCall<{ downloadUrl: string }>('GET', `/api/sessions/${sessionId}/export?format=${format}`);
  },
};
