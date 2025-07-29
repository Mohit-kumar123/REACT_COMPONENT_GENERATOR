'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSessionStore } from '@/store';
import { sessionService } from '@/services/sessions';
import { aiService } from '@/services/ai';
import { Session, ChatMessage } from '@/types';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Code,
  Download,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import ComponentViewer from '@/components/preview/ComponentViewer';

export default function SessionChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { currentSession, setCurrentSession } = useSessionStore();
  
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const response = await sessionService.getSession(sessionId);
      
      if (response.success && response.data) {
        setSession(response.data.session);
        setCurrentSession(response.data.session);
        setMessages(response.data.session.messages || []);
      } else {
        toast.error('Session not found');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const userMessage: ChatMessage = {
      _id: Date.now().toString(),
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);

    try {
      // Send directly to AI chat service - it will handle message storage
      const chatResponse = await aiService.chat(userMessage.content, sessionId, session?.settings?.model || 'gemini-pro');
      
      if (chatResponse.success && chatResponse.data) {
        const assistantMessage: ChatMessage = {
          _id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: chatResponse.data.message,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Check if the message indicates component generation
        const shouldGenerateComponent = userMessage.content.toLowerCase().includes('generate') || 
                                      userMessage.content.toLowerCase().includes('create') ||
                                      userMessage.content.toLowerCase().includes('build');
        
        if (shouldGenerateComponent) {
          setIsGenerating(true);
          try {
            const componentResponse = await aiService.generateComponent({
              sessionId,
              prompt: userMessage.content,
              model: session?.settings?.model || 'gemini-pro',
            });

            if (componentResponse.success && componentResponse.data) {
              const componentMessage: ChatMessage = {
                _id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Component generated successfully! Created version ${componentResponse.data.version}.`,
                timestamp: new Date().toISOString(),
              };

              setMessages(prev => [...prev, componentMessage]);
              
              // Reload session to get updated components
              await loadSession();
              
              toast.success('Component generated successfully!');
            }
          } catch (componentError) {
            console.error('Component generation failed:', componentError);
            toast.error('Failed to generate component');
          } finally {
            setIsGenerating(false);
          }
        }
        
      } else {
        throw new Error(chatResponse.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Remove the user message on error
      setMessages(prev => prev.filter(msg => msg._id !== userMessage._id));
    } finally {
      setIsSending(false);
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-400">Loading chat...</p>
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
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/session/${sessionId}`)}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">
            {session.title || 'Untitled Session'}
          </h1>
          <p className="text-sm text-slate-400">
            {session.components?.length || 0} components generated
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/session/${sessionId}`)}
        >
          <Eye size={16} className="mr-2" />
          View Components
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Describe the component you want to create and I'll help you build it step by step.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Bot size={16} className="text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {(isSending || isGenerating) && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="bg-slate-700 text-white p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span className="text-sm">
                        {isGenerating ? 'Generating component...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t border-slate-700 pt-4 mt-4">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe the component you want to create..."
                className="flex-1 min-h-[60px] max-h-[120px] bg-slate-700 border-slate-600 text-white resize-none"
                disabled={isSending || isGenerating}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending || isGenerating}
                className="self-end"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Components Sidebar */}
        <div className="w-80">
          <Card className="bg-slate-800 border-slate-700 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Code size={16} />
                Generated Components ({session.components?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-3">
                  {session.components && session.components.length > 0 ? (
                    session.components.map((component, index) => (
                      <div
                        key={component._id || index}
                        className="p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">
                            Component v{component.version}
                          </h4>
                          <div className="flex gap-1">
                            <ComponentViewer component={component} />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const blob = new Blob([component.jsx], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `component-v${component.version}.jsx`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                toast.success('Component downloaded!');
                              }}
                            >
                              <Download size={14} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {component.generationPrompt?.substring(0, 100)}...
                        </p>
                        <div className="text-xs text-slate-500">
                          {new Date(component.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-8 text-sm">
                      No components yet. Start chatting to generate your first component!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
