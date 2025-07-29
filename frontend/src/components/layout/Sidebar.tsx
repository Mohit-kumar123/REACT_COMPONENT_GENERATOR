'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUIStore, useSessionStore } from '@/store';
import { 
  Plus, 
  MessageSquare, 
  History, 
  Download, 
  Settings,
  ChevronLeft,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const { sessions, currentSession } = useSessionStore();
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'New Session',
      icon: Plus,
      href: '/dashboard/new',
      active: pathname === '/dashboard/new',
    },
    {
      label: 'Chat',
      icon: MessageSquare,
      href: currentSession ? `/dashboard/session/${currentSession._id}` : '/dashboard/new',
      active: pathname.startsWith('/dashboard/session/'),
      disabled: !currentSession,
    },
  ];

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-800 border-r border-slate-700 z-40">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <div className="p-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 text-left",
                  item.active && "bg-slate-700 text-white",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !item.disabled && router.push(item.href)}
                disabled={item.disabled}
              >
                <item.icon size={18} />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <Separator className="bg-slate-700" />

        {/* Session History */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Recent Sessions</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-white"
              onClick={() => router.push('/dashboard/history')}
            >
              <History size={14} />
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No sessions yet
                </p>
              ) : (
                sessions.slice(0, 10).map((session) => (
                  <Button
                    key={session._id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-auto p-2 flex-col items-start",
                      currentSession?._id === session._id && "bg-slate-700"
                    )}
                    onClick={() => router.push(`/dashboard/session/${session._id}`)}
                  >
                    <div className="text-xs font-medium text-white truncate w-full">
                      {session.title || 'Untitled Session'}
                    </div>
                    <div className="text-xs text-slate-400 truncate w-full">
                      {new Date(session.statistics.lastActiveAt).toLocaleDateString()}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-slate-700" />

        {/* Quick Actions */}
        <div className="p-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/dashboard/downloads')}
            >
              <Download size={16} />
              Downloads
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
