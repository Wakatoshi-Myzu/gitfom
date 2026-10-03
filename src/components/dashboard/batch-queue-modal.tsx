import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { GitHubUserBasic } from '@/lib/api/github';
import { AlertTriangle, Pause, Play, XCircle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface BatchQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: GitHubUserBasic[];
  onUnfollowSingle: (username: string) => Promise<void>;
  onBatchComplete: (unfollowedUsernames: string[]) => void;
}

export function BatchQueueModal({
  isOpen,
  onClose,
  selectedUsers,
  onUnfollowSingle,
  onBatchComplete,
}: BatchQueueModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [successUsers, setSuccessUsers] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ username: string; status: 'pending' | 'success' | 'error'; message?: string }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsRunning(false);
      setIsPaused(false);
      setIsFinished(false);
      setSuccessUsers([]);
      setLogs(selectedUsers.map((u) => ({ username: u.login, status: 'pending' })));
    }
  }, [isOpen, selectedUsers]);

  const startBatchProcess = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseBatchProcess = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (!isRunning || isPaused || isFinished) return;

    if (currentIndex >= selectedUsers.length) {
      setIsRunning(false);
      setIsFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onBatchComplete(successUsers);
      return;
    }

    const targetUser = selectedUsers[currentIndex];

    const executeStep = async () => {
      try {
        await onUnfollowSingle(targetUser.login);
        setSuccessUsers((prev) => [...prev, targetUser.login]);
        setLogs((prev) =>
          prev.map((item) =>
            item.username.toLowerCase() === targetUser.login.toLowerCase()
              ? { ...item, status: 'success' }
              : item
          )
        );
      } catch (err: any) {
        setLogs((prev) =>
          prev.map((item) =>
            item.username.toLowerCase() === targetUser.login.toLowerCase()
              ? { ...item, status: 'error', message: err.message || 'Failed to unfollow' }
              : item
          )
        );
      }

      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 800);
    };

    executeStep();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, isPaused, currentIndex, selectedUsers, isFinished]);

  if (!isOpen) return null;

  const total = selectedUsers.length;
  const progressPercent = total > 0 ? Math.round((currentIndex / total) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <ShieldCheck className="w-5 h-5 text-status-notFollowing" /> Batch Unfollow Queue Processor
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sequential execution with Anti-Abuse Rate Control (800ms delay per request).
              </p>
            </div>
            {!isRunning && (
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Unfollow Progress: <strong className="text-foreground">{currentIndex}</strong> / {total} Accounts
                </span>
                <span className="text-primary font-mono">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                <motion.div
                  className="h-full bg-gradient-to-r from-status-notFollowing to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Safety Warning */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Sequential Protection Active:</strong> Requests are executed one-by-one to prevent rate limit flags from GitHub. Please keep this browser tab open.
              </div>
            </div>

            {/* Live Queue Items */}
            <div className="space-y-2 border border-border rounded-xl p-3 bg-background/50 max-h-56 overflow-y-auto font-mono text-xs">
              {logs.map((log, idx) => (
                <div
                  key={log.username}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    idx === currentIndex && isRunning
                      ? 'bg-primary/10 border border-primary/30 text-primary font-bold'
                      : log.status === 'success'
                      ? 'bg-status-mutual/10 text-status-mutual'
                      : log.status === 'error'
                      ? 'bg-destructive/10 text-destructive'
                      : 'text-muted-foreground opacity-60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                    <span>@{log.username}</span>
                  </span>
                  <div>
                    {log.status === 'success' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-status-mutual">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unfollowed
                      </span>
                    )}
                    {log.status === 'error' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
                        <XCircle className="w-3.5 h-3.5" /> {log.message}
                      </span>
                    )}
                    {log.status === 'pending' && (
                      <span className="text-[11px] text-muted-foreground">
                        {idx === currentIndex && isRunning ? (
                          <span className="flex items-center gap-1 text-primary">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Processing...
                          </span>
                        ) : (
                          'Pending'
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
            {!isRunning && !isPaused && !isFinished && (
              <Button variant="statusNotFollowing" className="w-full gap-2" onClick={startBatchProcess}>
                <Play className="w-4 h-4 fill-current" /> Start Batch Unfollow ({total} Accounts)
              </Button>
            )}

            {isRunning && (
              <Button variant="secondary" className="w-full gap-2" onClick={pauseBatchProcess}>
                <Pause className="w-4 h-4" /> Pause
              </Button>
            )}

            {isPaused && !isFinished && (
              <div className="flex gap-2 w-full">
                <Button variant="primary" className="flex-1 gap-2" onClick={startBatchProcess}>
                  <Play className="w-4 h-4 fill-current" /> Resume
                </Button>
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel / Exit
                </Button>
              </div>
            )}

            {isFinished && (
              <Button variant="primary" className="w-full" onClick={onClose}>
                Done (Close Modal)
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
