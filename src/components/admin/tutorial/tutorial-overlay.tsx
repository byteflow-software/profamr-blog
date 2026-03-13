'use client';

import { useEffect, useMemo, useState, useCallback, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export interface TutorialOverlayStep<TId = string> {
  id: TId;
  selector: string;
  title: string;
  description: string;
}

interface TutorialOverlayProps {
  isActive: boolean;
  step: TutorialOverlayStep | null;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onDismiss?: () => void;
  stepLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

const HIGHLIGHT_PADDING = 12;

export function TutorialOverlay({
  isActive,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onDismiss,
  stepLabel,
  nextLabel = 'Próximo',
  finishLabel = 'Finalizar',
}: TutorialOverlayProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [rect, setRect] = useState<HighlightRect | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const scrollToTarget = useCallback((target: HTMLElement) => {
    const bounds = target.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const margin = 120;

    const isVisible =
      bounds.top >= margin &&
      bounds.bottom <= viewportHeight - margin;

    if (!isVisible) {
      // Try the admin content container first, then any scrollable parent, then window
      const adminContent = document.querySelector<HTMLElement>('.admin-content');
      const scrollContainer = adminContent || findScrollableParent(target);

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollOffset = bounds.top - containerRect.top + scrollContainer.scrollTop;
        const centerOffset = Math.max(0, scrollOffset - viewportHeight / 3);
        scrollContainer.scrollTo({ top: centerOffset, behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }, []);

  useEffect(() => {
    if (!isActive || !step) {
      setRect(null);
      return;
    }

    const resolveRect = () => {
      const target = document.querySelector<HTMLElement>(step.selector);
      if (!target) {
        setRect(null);
        return;
      }
      const bounds = target.getBoundingClientRect();
      setRect({
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
        bottom: bounds.bottom,
      });
    };

    const target = document.querySelector<HTMLElement>(step.selector);
    if (target) {
      // Resolve position immediately so highlight doesn't flash in center
      resolveRect();

      scrollToTarget(target);

      // Re-resolve after scroll settles
      const scrollTimer = setTimeout(resolveRect, 400);
      const scrollTimer2 = setTimeout(resolveRect, 800);

      window.addEventListener('resize', resolveRect);
      window.addEventListener('scroll', resolveRect, true);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(scrollTimer2);
        window.removeEventListener('resize', resolveRect);
        window.removeEventListener('scroll', resolveRect, true);
      };
    } else {
      resolveRect();
    }
  }, [isActive, step, stepIndex, scrollToTarget]);

  const defaultStepLabel = useMemo(
    () => `Passo ${stepIndex + 1} de ${totalSteps}`,
    [stepIndex, totalSteps],
  );
  const isLastStep = stepIndex + 1 === totalSteps;

  if (!isMounted || !isActive || !step) return null;

  const highlightStyles = rect
    ? {
        top: Math.max(rect.top - HIGHLIGHT_PADDING, 4),
        left: Math.max(rect.left - HIGHLIGHT_PADDING, 4),
        width: rect.width + HIGHLIGHT_PADDING * 2,
        height: rect.height + HIGHLIGHT_PADDING * 2,
      }
    : null;

  const infoPanelStyles: CSSProperties = rect
    ? (() => {
        const panelMaxWidth = 400;
        const panelHeight = 220;
        const gap = 20;

        let top = rect.bottom + gap;
        if (top + panelHeight > window.innerHeight - 20) {
          top = Math.max(rect.top - panelHeight - gap, 20);
        }

        let left = rect.left + rect.width / 2 - panelMaxWidth / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - panelMaxWidth - 16));

        return { top, left, maxWidth: panelMaxWidth };
      })()
    : { top: '40%', left: '50%', transform: 'translateX(-50%)' };

  return createPortal(
    <div className="tutorial-overlay">
      {!highlightStyles && <div className="tutorial-backdrop" aria-hidden />}

      {highlightStyles && (
        <div
          className="tutorial-highlight"
          style={{
            top: highlightStyles.top,
            left: highlightStyles.left,
            width: highlightStyles.width,
            height: highlightStyles.height,
          }}
        />
      )}

      <div className="tutorial-panel-anchor" style={infoPanelStyles}>
        <div className="tutorial-panel">
          <div className="tutorial-panel-header">
            <p className="tutorial-step-label">{stepLabel ?? defaultStepLabel}</p>
            {onDismiss && (
              <button
                className="tutorial-close-btn"
                onClick={onDismiss}
                aria-label="Fechar tutorial"
                title="Fechar tutorial"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <h3 className="tutorial-title">{step.title}</h3>
          <p className="tutorial-description">{step.description}</p>
          <div className="tutorial-actions">
            <button className="tutorial-next-btn" onClick={onNext}>
              {isLastStep ? finishLabel : nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function findScrollableParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent) {
    const { overflow, overflowY } = window.getComputedStyle(parent);
    if (
      overflow === 'auto' || overflow === 'scroll' ||
      overflowY === 'auto' || overflowY === 'scroll'
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}
