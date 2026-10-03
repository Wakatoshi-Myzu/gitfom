import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricsCardsProps {
  followingCount: number;
  followersCount: number;
  notFollowingBackCount: number;
  mutualsCount: number;
  fansCount: number;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function MetricsCards({
  followingCount,
  followersCount,
  notFollowingBackCount,
  mutualsCount,
  fansCount,
  activeTab,
  onSelectTab,
}: MetricsCardsProps) {
  const cards = [
    {
      id: 'notFollowingBack',
      title: 'Not Following Back',
      subtitle: 'Unfollow Targets',
      value: notFollowingBackCount,
      icon: UserX,
      color: 'text-status-notFollowing',
      bgColor: 'bg-status-notFollowing/10 border-status-notFollowing/20',
      badgeBg: 'bg-status-notFollowing text-status-notFollowing-foreground',
      active: activeTab === 'notFollowingBack',
    },
    {
      id: 'mutuals',
      title: 'Mutual Connections',
      subtitle: 'Mutual Following',
      value: mutualsCount,
      icon: HeartHandshake,
      color: 'text-status-mutual',
      bgColor: 'bg-status-mutual/10 border-status-mutual/20',
      badgeBg: 'bg-status-mutual text-status-mutual-foreground',
      active: activeTab === 'mutuals',
    },
    {
      id: 'fans',
      title: 'Fans',
      subtitle: 'Not Followed Back',
      value: fansCount,
      icon: UserCheck,
      color: 'text-status-fan',
      bgColor: 'bg-status-fan/10 border-status-fan/20',
      badgeBg: 'bg-status-fan text-status-fan-foreground',
      active: activeTab === 'fans',
    },
    {
      id: 'following',
      title: 'Total Following',
      subtitle: `Followers: ${followersCount.toLocaleString()}`,
      value: followingCount,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/20',
      badgeBg: 'bg-primary text-primary-foreground',
      active: activeTab === 'following',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <Card
              onClick={() => onSelectTab && onSelectTab(card.id)}
              className={`cursor-pointer border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                card.active
                  ? `${card.bgColor} ring-2 ring-primary ring-offset-2 shadow-lg`
                  : 'hover:border-border/80 hover:bg-card/90'
              }`}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className={`text-3xl font-extrabold tracking-tight ${card.color}`}>
                    {card.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {card.subtitle}
                  </div>
                </div>

                {/* Subtle visual accent bar */}
                <div
                  className={`mt-4 h-1 w-full rounded-full transition-all duration-300 ${
                    card.active ? card.badgeBg : 'bg-muted/40 group-hover:bg-muted'
                  }`}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
