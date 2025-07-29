'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSessionStore } from '@/store';
import { sessionService } from '@/services/sessions';
import { Session } from '@/types';
import { Plus, MessageSquare, Download, TrendingUp, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { sessions, setSessions, setLoading } = useSessionStore();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalComponents: 0,
    recentActivity: 0,
  });
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sessionService.getSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
        
        // Calculate stats
        const totalSessions = response.data.sessions.length;
        const totalComponents = response.data.sessions.reduce(
          (acc: number, session: Session) => acc + session.components.length, 
          0
        );
        const recentActivity = response.data.sessions.filter(
          (session: Session) => new Date(session.statistics.lastActiveAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        setStats({
          totalSessions,
          totalComponents,
          recentActivity,
        });
      }
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [setSessions, setLoading]);

  const createNewSession = async () => {
    try {
      const response = await sessionService.createSession({
        title: `Session ${new Date().toLocaleDateString()}`,
        description: 'New AI component generation session',
      });

      if (response.success && response.data) {
        router.push(`/dashboard/session/${response.data.session._id}`);
      } else {
        toast.error('Failed to create session');
      }
    } catch (err) {
      toast.error('Failed to create session');
    }
  };

  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-slate-400">
          Ready to create some amazing components with AI assistance?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Sessions
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalSessions}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              AI generation sessions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Components Generated
            </CardTitle>
            <Zap className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalComponents}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ready to use components
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Recent Activity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.recentActivity}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sessions this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Get started with AI component generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={createNewSession}
              className="w-full justify-start gap-2"
              size="lg"
            >
              <Plus size={18} />
              Start New Session
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => router.push('/dashboard/history')}
            >
              <Clock size={18} />
              View Session History
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => router.push('/dashboard/downloads')}
            >
              <Download size={18} />
              Manage Downloads
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Sessions</CardTitle>
            <CardDescription className="text-slate-400">
              Continue where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No sessions yet</p>
                <Button onClick={createNewSession}>
                  Create Your First Session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/session/${session._id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">
                        {session.title || 'Untitled Session'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {session.components.length} component(s) • {' '}
                        {new Date(session.statistics.lastActiveAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Continue
                    </Button>
                  </div>
                ))}
                
                {sessions.length > 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => router.push('/dashboard/history')}
                  >
                    View All Sessions
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
