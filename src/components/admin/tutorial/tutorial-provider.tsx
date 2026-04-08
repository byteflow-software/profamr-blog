'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { getTutorialProgress, completeTutorial, completeAllTutorials } from '@/app/admin/tutorial/actions';

const STORAGE_KEY = 'profamr-tutorials-done';

interface TutorialContextValue {
  completedPages: string[];
  markComplete: (pageId: string) => void;
  markAllComplete: () => void;
}

export const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [completedPages, setCompletedPages] = useState<string[]>([]);

  // Fetch server-side progress on mount and merge with localStorage
  useEffect(() => {
    getTutorialProgress().then((result) => {
      if (result.success) {
        const serverPages = result.data;
        setCompletedPages(serverPages);

        // Merge server state into localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const localMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
          for (const pid of serverPages) {
            localMap[pid] = true;
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localMap));
        } catch {
          // localStorage unavailable
        }
      }
    });
  }, []);

  const markComplete = useCallback((pageId: string) => {
    setCompletedPages((prev) => (prev.includes(pageId) ? prev : [...prev, pageId]));
    completeTutorial(pageId).catch(() => {});
  }, []);

  const markAllComplete = useCallback(() => {
    completeAllTutorials().then((result) => {
      if (result.success) {
        setCompletedPages(result.data);
        try {
          const map: Record<string, boolean> = {};
          for (const pid of result.data) map[pid] = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch {}
      }
    }).catch(() => {});
  }, []);

  return (
    <TutorialContext.Provider value={{ completedPages, markComplete, markAllComplete }}>
      {children}
    </TutorialContext.Provider>
  );
}
