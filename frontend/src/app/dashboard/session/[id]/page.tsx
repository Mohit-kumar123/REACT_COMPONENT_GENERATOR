'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store';
import { sessionService } from '@/services/sessions';
import { Session } from '@/types';
import { ArrowLeft, MessageSquare, Code, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ComponentViewer from '@/components/preview/ComponentViewer';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { currentSession, setCurrentSession } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getSession(sessionId);
      
      if (response.success && response.data) {
        setSession(response.data.session);
        setCurrentSession(response.data.session);
      } else {
        toast.error('Session not found');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Session not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {session.title || 'Untitled Session'}
          </h1>
          <p className="text-slate-400">
            Created {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Session Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare size={20} />
              Chat History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {session.messages && session.messages.length > 0 ? (
                session.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600/20 ml-8'
                        : 'bg-slate-700/50 mr-8'
                    }`}
                  >
                    <div className="text-xs text-slate-400 mb-1">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="text-white text-sm">{message.content}</div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No messages in this session yet
                </p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/dashboard/session/${sessionId}/chat`)}
              >
                <MessageSquare size={16} className="mr-2" />
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Code size={20} />
              Generated Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {session.components && session.components.length > 0 ? (
                session.components.map((component, index) => (
                  <div
                    key={component._id || index}
                    className="p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">
                        Component v{component.version} 
                      </h4>
                      <ComponentViewer component={component} />
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {component.generationPrompt || 'React Component'}
                    </p>
                    <div className="text-xs text-slate-500">
                      Created {new Date(component.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No components generated yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={() => router.push(`/dashboard/session/${sessionId}/chat`)}
          className="flex items-center gap-2"
        >
          <MessageSquare size={16} />
          Continue Chat
        </Button>
        <Button 
          variant="outline"
          onClick={() => {
            toast.info('Export functionality coming soon');
          }}
        >
          Export Components
        </Button>
      </div>
    </div>
  );
}
