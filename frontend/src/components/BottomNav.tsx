import { Home, Users, Calendar, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: Home, label: '홈', path: '/' },
  { icon: Users, label: '직원관리', path: '/employees' },
  { icon: Calendar, label: '일정관리', path: '/schedule' },
  { icon: MessageCircle, label: '게시판', path: '/board', badge: 1 },
  { icon: User, label: '내 정보', path: '/profile' },
];

interface BottomNavProps {
  currentPath: string;
}

export const BottomNav = ({ currentPath }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || 
            (item.path === '/employees' && currentPath.startsWith('/employee'));
          
          return (
            <button
              key={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-1 px-3 relative',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};
