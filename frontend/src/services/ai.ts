import { apiCall } from './api';
import { AIModel, GenerateComponentRequest, RefineComponentRequest, AIResponse, ComponentVersion } from '@/types';

export const aiService = {
  // Get available AI models
  getModels: async () => {
    return apiCall<AIModel[]>('GET', '/api/ai/models');
  },

  // Generate new component
  generateComponent: async (request: GenerateComponentRequest) => {
    return apiCall<{
      component: ComponentVersion;
      version: number;
      sessionId: string;
    }>('POST', '/api/ai/generate', request);
  },

  // Refine existing component
  refineComponent: async (request: RefineComponentRequest) => {
    return apiCall<{
      component: ComponentVersion;
      version: number;
      sessionId: string;
    }>('POST', '/api/ai/refine', request);
  },

  // Chat with AI (general conversation)
  chat: async (message: string, sessionId: string, model?: string) => {
    return apiCall<{
      message: string;
      sessionId: string;
    }>('POST', '/api/ai/chat', {
      message,
      sessionId,
      model,
    });
  },
};
