'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { TutorialOverlayStep } from './tutorial-overlay';
import { TutorialContext } from './tutorial-provider';

const STORAGE_KEY = 'profamr-tutorials-done';

function getDoneMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function markPageDoneLocal(pageId: string) {
  try {
    const map = getDoneMap();
    map[pageId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage unavailable
  }
}

function isPageDoneLocal(pageId: string): boolean {
  return getDoneMap()[pageId] === true;
}

interface UsePageTutorialOptions {
  pageId: string;
  steps: TutorialOverlayStep[];
  autoStart?: boolean;
  delay?: number;
}

export function usePageTutorial({
  pageId,
  steps,
  autoStart = true,
  delay = 800,
}: UsePageTutorialOptions) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hasAutoStarted = useRef(false);
  const visibleStepsRef = useRef<TutorialOverlayStep[]>([]);

  const tutorialCtx = useContext(TutorialContext);

  const getVisibleSteps = useCallback(() => {
    return steps.filter((s) => {
      const el = document.querySelector(s.selector);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }, [steps]);

  const isPageDone = useCallback((pid: string): boolean => {
    if (isPageDoneLocal(pid)) return true;
    if (tutorialCtx?.completedPages.includes(pid)) return true;
    return false;
  }, [tutorialCtx?.completedPages]);

  useEffect(() => {
    if (!autoStart || hasAutoStarted.current) return;
    hasAutoStarted.current = true;

    const timer = setTimeout(() => {
      const visible = getVisibleSteps();
      if (visible.length > 0) {
        visibleStepsRef.current = visible;
        setStepIndex(0);
        setIsActive(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [autoStart, pageId, getVisibleSteps, delay]);

  const startTutorial = useCallback(() => {
    const visible = getVisibleSteps();
    if (visible.length > 0) {
      visibleStepsRef.current = visible;
      setStepIndex(0);
      setIsActive(true);
    }
  }, [getVisibleSteps]);

  const handleNext = useCallback(() => {
    const visible = visibleStepsRef.current;
    if (stepIndex + 1 >= visible.length) {
      setIsActive(false);
      markPageDoneLocal(pageId);
      tutorialCtx?.markComplete(pageId);
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, pageId, tutorialCtx]);

  const dismissTutorial = useCallback((permanent = false) => {
    setIsActive(false);
    if (permanent) {
      markPageDoneLocal(pageId);
      tutorialCtx?.markComplete(pageId);
    }
  }, [pageId, tutorialCtx]);

  const visible = visibleStepsRef.current;
  const currentStep = isActive && visible.length > 0 ? visible[stepIndex] ?? null : null;

  return {
    isActive,
    currentStep,
    stepIndex,
    totalSteps: visible.length,
    startTutorial,
    handleNext,
    dismissTutorial,
  };
}
