'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store';
import { Menu, User, Settings, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUIStore();
  const router = useRouter();
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-300 hover:text-white"
        >
          <Menu size={20} />
        </Button>
        
        <h1 className="text-xl font-semibold text-white">
          AI Component Generator
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-300">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              onClick={() => router.push('/dashboard/settings')}
              className="flex items-center gap-2"
            >
              <User size={16} />
              Profile & Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <LogOut size={16} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
