import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Eye, EyeOff, ShieldCheck, ExternalLink, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PATInputCardProps {
  onTokenSubmit: (token: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function PATInputCard({ onTokenSubmit, isLoading, error }: PATInputCardProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    onTokenSubmit(tokenInput.trim());
  };

  const handleDemoMode = () => {
    onTokenSubmit('demo_github_pat_token_2026');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl mx-auto my-12"
    >
      <Card className="border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-status-notFollowing/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="text-center space-y-2 pt-8 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            GitHub Follower & Unfollow Dashboard
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter your GitHub Personal Access Token (PAT) to analyze follower relationships and safely manage your account connections.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Personal Access Token (PAT)</span>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-primary hover:underline inline-flex items-center gap-1 normal-case font-normal text-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  How to create PAT?
                </button>
              </label>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="github_pat_11A... or ghp_..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-background/80 border border-input text-foreground text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                  title={showToken ? 'Hide Token' : 'Show Token'}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2"
              >
                <span className="font-bold">Error:</span> {error}
              </motion.div>
            )}

            {showHelp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-muted/60 border border-border text-xs space-y-2 leading-relaxed text-muted-foreground"
              >
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-status-mutual" /> Steps to Generate GitHub Token:
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Open <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">GitHub Developer Settings <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Select <strong>Tokens (classic)</strong> or <strong>Fine-grained tokens</strong>.</li>
                  <li>Enable required scopes: <code className="bg-background px-1.5 py-0.5 rounded border font-mono text-[11px] text-foreground">user:follow</code> and <code className="bg-background px-1.5 py-0.5 rounded border font-mono text-[11px] text-foreground">read:user</code> (or <em>Followers: Read & Write</em>).</li>
                  <li>Copy the generated token and paste it into the field above.</li>
                </ol>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold shadow-lg"
              isLoading={isLoading}
              disabled={!tokenInput.trim()}
            >
              Analyze GitHub Relationships
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider relative z-10">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full border-dashed border-primary/30 hover:border-primary/60 text-xs gap-2"
            onClick={handleDemoMode}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            Try Demo Mode (No GitHub Token Required)
          </Button>
        </CardContent>

        <CardFooter className="bg-muted/30 border-t border-border/50 py-3 px-8 text-center justify-center">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-status-mutual" /> Tokens are stored temporarily in your browser session storage only.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
