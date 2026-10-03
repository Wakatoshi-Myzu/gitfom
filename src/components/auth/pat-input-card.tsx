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
    // Demo token format or trigger
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
            Masukkan GitHub Personal Access Token (PAT) Anda untuk menganalisis relasi pengikut dan mengelola daftar akun secara aman.
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
                  Cara buat PAT?
                </button>
              </label>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="github_pat_11A..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-background/80 border border-input text-foreground text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                  title={showToken ? 'Sembunyikan Token' : 'Tampilkan Token'}
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
                  <ShieldCheck className="w-4 h-4 text-status-mutual" /> Langkah Membuat Token GitHub:
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buka <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">GitHub Developer Settings <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Pilih <strong>Fine-grained tokens</strong> atau <strong>Tokens (classic)</strong>.</li>
                  <li>Aktifkan scope: <code className="bg-background px-1.5 py-0.5 rounded border font-mono text-[11px] text-foreground">user:follow</code> dan <code className="bg-background px-1.5 py-0.5 rounded border font-mono text-[11px] text-foreground">read:user</code>.</li>
                  <li>Salin token yang dihasilkan dan tempelkan pada form di atas.</li>
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
              Analisis Relasi GitHub
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider relative z-10">
              atau
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
            Coba Demo Mode (Tanpa Token GitHub)
          </Button>
        </CardContent>

        <CardFooter className="bg-muted/30 border-t border-border/50 py-3 px-8 text-center justify-center">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-status-mutual" /> Token hanya disimpan sementara di peramban Anda (Session Storage).
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
