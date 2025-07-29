import { apiCall } from './api';
import { ComponentVersion } from '@/types';

export const componentService = {
  // Get component versions for a session
  getVersions: async (sessionId: string) => {
    return apiCall<{
      versions: Array<{
        version: number;
        createdAt: string;
        generationPrompt: string;
        metadata: ComponentVersion['metadata'];
      }>;
      currentVersion: number;
      sessionTitle: string;
    }>('GET', `/api/components/${sessionId}/versions`);
  },

  // Get specific component version
  getComponent: async (sessionId: string, version: number) => {
    return apiCall<{ component: ComponentVersion }>('GET', `/api/components/${sessionId}/${version}`);
  },

  // Get current component
  getCurrentComponent: async (sessionId: string) => {
    return apiCall<{ component: ComponentVersion }>('GET', `/api/components/${sessionId}/current`);
  },

  // Set component version as current
  setCurrentVersion: async (sessionId: string, version: number) => {
    return apiCall<{ currentVersion: number }>('POST', `/api/components/${sessionId}/${version}/set-current`);
  },

  // Update component code manually
  updateComponent: async (sessionId: string, version: number, data: {
    jsx: string;
    css?: string;
    props?: Record<string, any>;
  }) => {
    return apiCall<{ component: ComponentVersion }>('PUT', `/api/components/${sessionId}/${version}`, data);
  },

  // Download component as ZIP
  downloadComponent: async (sessionId: string, version: number | 'current' = 'current') => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://ai-component-generator-backend-18mr.onrender.com'}/api/components/${sessionId}/${version}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `component-v${version}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error: any) {
      console.error('Download error:', error);
      return { success: false, message: error.message };
    }
  },

  // Duplicate component version
  duplicateComponent: async (sessionId: string, version: number) => {
    return apiCall<{
      component: ComponentVersion;
      newVersion: number;
    }>('POST', `/api/components/${sessionId}/${version}/duplicate`);
  },
};
