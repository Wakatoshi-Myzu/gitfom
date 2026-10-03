import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { PATInputCard } from '@/components/auth/pat-input-card';
import { MetricsCards } from '@/components/dashboard/metrics-cards';
import { RelationshipTabs, TabType } from '@/components/dashboard/relationship-tabs';
import { UnfollowTable } from '@/components/dashboard/unfollow-table';
import { BatchQueueModal } from '@/components/dashboard/batch-queue-modal';
import { useWhitelist } from '@/hooks/use-whitelist';
import { githubKeys } from '@/lib/query-keys';
import { fetchUserProfile, fetchAllPages, unfollowUser, followUser, GitHubUserBasic, RelationshipAnalysis } from '@/lib/api/github';
import { generateDemoData } from '@/lib/demo-data';
import { RefreshCw, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SESSION_TOKEN_KEY = 'github_pat_session_v1';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function DashboardContent() {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  });
  const [activeTab, setActiveTab] = useState<TabType>('notFollowingBack');
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedBatchUsers, setSelectedBatchUsers] = useState<GitHubUserBasic[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isWhitelisted, toggleWhitelist, whitelist } = useWhitelist();
  const qc = useQueryClient();

  const isDemo = token === 'demo_github_pat_token_2026';

  // Relationship data query
  const { data, isLoading, error, refetch } = useQuery<RelationshipAnalysis>({
    queryKey: githubKeys.relationships.comparison(token ?? ''),
    queryFn: async () => {
      if (!token) throw new Error('PAT Token required');
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        return generateDemoData();
      }

      const [profile, followers, following] = await Promise.all([
        fetchUserProfile(token),
        fetchAllPages<GitHubUserBasic>('/user/followers', token),
        fetchAllPages<GitHubUserBasic>('/user/following', token),
      ]);

      const followersMap = new Map(followers.map((u) => [u.login.toLowerCase(), u]));
      const followingMap = new Map(following.map((u) => [u.login.toLowerCase(), u]));

      const notFollowingBack = following.filter((u) => !followersMap.has(u.login.toLowerCase()));
      const mutuals = following.filter((u) => followersMap.has(u.login.toLowerCase()));
      const fans = followers.filter((u) => !followingMap.has(u.login.toLowerCase()));

      return {
        userProfile: profile,
        followers,
        following,
        notFollowingBack,
        mutuals,
        fans,
      };
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 15,
  });

  // Save/clear token
  const handleTokenSubmit = (newToken: string) => {
    sessionStorage.setItem(SESSION_TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setToken(null);
    qc.clear();
  };

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Single Unfollow Mutation
  const unfollowMutation = useMutation({
    mutationFn: async (username: string) => {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 400));
        return;
      }
      return unfollowUser(username, token!);
    },
    onSuccess: (_, username) => {
      const lower = username.toLowerCase();
      qc.setQueryData<RelationshipAnalysis>(
        githubKeys.relationships.comparison(token!),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            following: old.following.filter((u) => u.login.toLowerCase() !== lower),
            notFollowingBack: old.notFollowingBack.filter((u) => u.login.toLowerCase() !== lower),
            mutuals: old.mutuals.filter((u) => u.login.toLowerCase() !== lower),
          };
        }
      );
      showToast(`Successfully unfollowed @${username}`);
    },
    onError: (err: any, username) => {
      showToast(`Failed to unfollow @${username}: ${err.message}`);
    },
  });

  // Single Follow Mutation (for Fans tab)
  const followMutation = useMutation({
    mutationFn: async (username: string) => {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 400));
        return;
      }
      return followUser(username, token!);
    },
    onSuccess: (_, username) => {
      const lower = username.toLowerCase();
      qc.setQueryData<RelationshipAnalysis>(
        githubKeys.relationships.comparison(token!),
        (old) => {
          if (!old) return old;
          const fanUser = old.fans.find((u) => u.login.toLowerCase() === lower);
          if (!fanUser) return old;
          return {
            ...old,
            following: [...old.following, fanUser],
            mutuals: [...old.mutuals, fanUser],
            fans: old.fans.filter((u) => u.login.toLowerCase() !== lower),
          };
        }
      );
      showToast(`Successfully followed back @${username}`);
    },
  });

  // Batch Unfollow Trigger
  const handleStartBatchUnfollow = (users: GitHubUserBasic[]) => {
    setSelectedBatchUsers(users);
    setBatchModalOpen(true);
  };

  const handleBatchComplete = (unfollowedUsernames: string[]) => {
    showToast(`Batch complete! Successfully unfollowed ${unfollowedUsernames.length} accounts.`);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onLogout={() => {}} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <PATInputCard onTokenSubmit={handleTokenSubmit} />
        </main>
      </div>
    );
  }

  // Filter current tab data
  const getCurrentTabData = (): GitHubUserBasic[] => {
    if (!data) return [];
    switch (activeTab) {
      case 'notFollowingBack':
        return data.notFollowingBack;
      case 'mutuals':
        return data.mutuals;
      case 'fans':
        return data.fans;
      case 'following':
        return data.following;
      case 'whitelisted':
        return data.following.filter((u) => isWhitelisted(u.login));
      default:
        return data.notFollowingBack;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar userProfile={data?.userProfile} onLogout={handleLogout} isDemo={isDemo} />

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background font-semibold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner for Demo mode */}
        {isDemo && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> You are exploring the dashboard with simulated data. To manage your real GitHub account, log out and enter your PAT token.
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout} className="border-amber-500/40 text-xs">
              Enter PAT Token
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="font-bold text-lg text-foreground">Fetching GitHub Relationship Data...</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Calculating followers, mutual connections, and non-reciprocal followings. Please wait a moment.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5" /> Failed to Load GitHub Data
            </div>
            <p className="text-xs text-destructive/90">{(error as Error).message}</p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="primary" onClick={() => refetch()}>
                Try Again
              </Button>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Change PAT Token
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Main View */}
        {data && (
          <>
            {/* KPI Cards */}
            <MetricsCards
              followingCount={data.following.length}
              followersCount={data.followers.length}
              notFollowingBackCount={data.notFollowingBack.length}
              mutualsCount={data.mutuals.length}
              fansCount={data.fans.length}
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab as TabType)}
            />

            {/* Main Data Section */}
            <div className="space-y-4">
              <RelationshipTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={{
                  notFollowingBack: data.notFollowingBack.length,
                  following: data.following.length,
                  mutuals: data.mutuals.length,
                  fans: data.fans.length,
                  whitelisted: Array.from(whitelist).length,
                }}
              />

              <UnfollowTable
                data={getCurrentTabData()}
                tabType={activeTab}
                isWhitelisted={isWhitelisted}
                onToggleWhitelist={toggleWhitelist}
                onUnfollowSingle={(username) => unfollowMutation.mutateAsync(username)}
                onFollowSingle={(username) => followMutation.mutateAsync(username)}
                onStartBatchUnfollow={handleStartBatchUnfollow}
                isUnfollowing={unfollowMutation.isPending}
              />
            </div>
          </>
        )}
      </main>

      {/* Batch Queue Modal */}
      <BatchQueueModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        selectedUsers={selectedBatchUsers}
        onUnfollowSingle={(username) => unfollowMutation.mutateAsync(username)}
        onBatchComplete={handleBatchComplete}
      />

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card py-6 mt-12 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>GitHub Follower Tracker & Bulk Unfollow Dashboard &copy; 2026</span>
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-status-mutual" /> Built with React, TanStack Query, & Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
