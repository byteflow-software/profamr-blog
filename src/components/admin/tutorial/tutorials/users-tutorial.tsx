'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'table',
    selector: '[data-tutorial="users-table"]',
    title: 'Lista de usuários',
    description: 'Gerencie os usuários da plataforma. Veja nome, email, função e conteúdo criado por cada um.',
  },
];

export function UsersTutorial() {
  const tutorial = usePageTutorial({ pageId: 'users-list', steps });

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
