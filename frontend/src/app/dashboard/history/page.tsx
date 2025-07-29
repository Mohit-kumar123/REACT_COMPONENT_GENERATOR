'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store';
import { sessionService } from '@/services/sessions';
import { Session } from '@/types';
import { ArrowLeft, MessageSquare, Code, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function HistoryPage() {
  const router = useRouter();
  const { sessions, setSessions } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (sessions) {
      const filtered = sessions.filter(session =>
        session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSessions(filtered);
    }
  }, [sessions, searchQuery]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getSessions();
      
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      } else {
        toast.error('Failed to load sessions');
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading session history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Session History</h1>
          <p className="text-slate-400">
            View and manage all your AI component sessions
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search sessions by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <Card key={session._id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {session.title || 'Untitled Session'}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={12} />
                  {new Date(session.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.description && (
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {session.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {session.statistics?.totalMessages || session.messages?.length || 0} messages
                    </div>
                    <div className="flex items-center gap-1">
                      <Code size={12} />
                      {session.components?.length || 0} components
                    </div>
                  </div>

                  {session.tags && session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {session.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {session.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-400">
                          +{session.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/session/${session._id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push(`/dashboard/session/${session._id}/chat`)}
                    >
                      <MessageSquare size={14} className="mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 mb-4">
              {searchQuery ? 'No sessions found matching your search' : 'No sessions found'}
            </div>
            <Button
              onClick={() => router.push('/dashboard/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
