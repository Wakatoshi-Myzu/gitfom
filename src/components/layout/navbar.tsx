import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GitHubUserBasic } from '@/lib/api/github';
import { Github, Sun, Moon, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  userProfile?: GitHubUserBasic;
  onLogout: () => void;
  isDemo?: boolean;
}

export function Navbar({ userProfile, onLogout, isDemo }: NavbarProps) {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-md shadow-primary/25">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight flex items-center gap-2 text-foreground">
              FollowTracker <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">Pro</span>
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">GitHub Unfollow & Relationship Management</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {userProfile && (
            <div className="flex items-center gap-3 pr-2 border-r border-border">
              <img
                src={userProfile.avatar_url}
                alt={userProfile.login}
                className="w-8 h-8 rounded-full border border-border object-cover"
              />
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-foreground">@{userProfile.login}</span>
                {isDemo ? (
                  <span className="text-[10px] text-amber-500 font-semibold">Demo Mode</span>
                ) : (
                  <span className="text-[10px] text-status-mutual font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Authenticated
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-colors"
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Logout Button */}
          {userProfile && (
            <Button variant="outline" size="sm" onClick={onLogout} className="text-xs gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
