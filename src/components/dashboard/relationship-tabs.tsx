import React from 'react';
import { UserX, Users, HeartHandshake, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '../ui/button';

export type TabType = 'notFollowingBack' | 'following' | 'mutuals' | 'fans' | 'whitelisted';

interface RelationshipTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    notFollowingBack: number;
    following: number;
    mutuals: number;
    fans: number;
    whitelisted: number;
  };
}

export function RelationshipTabs({ activeTab, onTabChange, counts }: RelationshipTabsProps) {
  const tabs: { id: TabType; label: string; icon: React.ElementType; count: number; badgeColor?: string }[] = [
    {
      id: 'notFollowingBack',
      label: 'Tidak Follow Back',
      icon: UserX,
      count: counts.notFollowingBack,
      badgeColor: 'bg-status-notFollowing/20 text-status-notFollowing',
    },
    {
      id: 'mutuals',
      label: 'Mutuals',
      icon: HeartHandshake,
      count: counts.mutuals,
      badgeColor: 'bg-status-mutual/20 text-status-mutual',
    },
    {
      id: 'fans',
      label: 'Fans',
      icon: Sparkles,
      count: counts.fans,
      badgeColor: 'bg-status-fan/20 text-status-fan',
    },
    {
      id: 'following',
      label: 'Semua Following',
      icon: Users,
      count: counts.following,
    },
    {
      id: 'whitelisted',
      label: 'Safe Whitelist',
      icon: ShieldCheck,
      count: counts.whitelisted,
      badgeColor: 'bg-amber-500/20 text-amber-500',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none relative',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span
              className={cn(
                'ml-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors',
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : tab.badgeColor || 'bg-background text-muted-foreground'
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
