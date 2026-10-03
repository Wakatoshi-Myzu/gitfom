import { useState, useEffect } from 'react';

const STORAGE_KEY = 'github_unfollow_whitelist_v1';

export function useWhitelist() {
  const [whitelist, setWhitelist] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored).map((s: string) => s.toLowerCase()));
      }
    } catch (e) {
      console.error('Failed to parse whitelist from localStorage', e);
    }
    // Default system whitelisted accounts for extra safety
    return new Set(['torvalds', 'shadcn', 'vercel', 'gaearon', 'sundarpichai']);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(whitelist)));
    } catch (e) {
      console.error('Failed to save whitelist to localStorage', e);
    }
  }, [whitelist]);

  const toggleWhitelist = (username: string) => {
    const lower = username.toLowerCase();
    setWhitelist((prev) => {
      const next = new Set(prev);
      if (next.has(lower)) {
        next.delete(lower);
      } else {
        next.add(lower);
      }
      return next;
    });
  };

  const isWhitelisted = (username: string) => {
    return whitelist.has(username.toLowerCase());
  };

  return {
    whitelist,
    toggleWhitelist,
    isWhitelisted,
  };
}
