import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Activity, Trophy, Brain, User } from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Activities',
    href: '/app/activities',
    icon: Activity,
  },
  {
    name: 'Challenges',
    href: '/app/challenges',
    icon: Trophy,
  },
  {
    name: 'Quizzes',
    href: '/app/quizzes',
    icon: Brain,
  },
  {
    name: 'Profile',
    href: '/app/profile',
    icon: User,
  },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-green-600 bg-green-50 dark:text-green-500 dark:bg-green-950'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
