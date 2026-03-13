'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'stat-cards',
    selector: '[data-tutorial="stat-cards"]',
    title: 'Visão geral',
    description: 'Aqui você encontra os números principais do seu blog: total de posts, artigos wiki, visualizações e usuários.',
  },
  {
    id: 'quick-actions',
    selector: '[data-tutorial="quick-actions"]',
    title: 'Ações rápidas',
    description: 'Use estes botões para criar um novo post ou artigo wiki rapidamente.',
  },
  {
    id: 'recent-posts',
    selector: '[data-tutorial="recent-posts"]',
    title: 'Posts recentes',
    description: 'Lista dos últimos posts modificados. Clique em qualquer um para editá-lo.',
  },
  {
    id: 'recent-wiki',
    selector: '[data-tutorial="recent-wiki"]',
    title: 'Wiki recente',
    description: 'Lista dos últimos artigos wiki atualizados. Clique para editar.',
  },
];

export function DashboardTutorial() {
  const tutorial = usePageTutorial({
    pageId: 'dashboard',
    steps,
  });

  return (
    <>
      <TutorialOverlay
        isActive={tutorial.isActive}
        step={tutorial.currentStep}
        stepIndex={tutorial.stepIndex}
        totalSteps={tutorial.totalSteps}
        onNext={tutorial.handleNext}
        onDismiss={tutorial.dismissTutorial}
      />
      {!tutorial.isActive && (
        <TutorialTriggerButton onClick={tutorial.startTutorial} />
      )}
    </>
  );
}
