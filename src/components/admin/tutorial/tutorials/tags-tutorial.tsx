'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'form',
    selector: '[data-tutorial="tag-form"]',
    title: 'Criar tag',
    description: 'Digite o nome da tag para criá-la. O slug é gerado automaticamente.',
  },
  {
    id: 'list',
    selector: '[data-tutorial="tag-list"]',
    title: 'Lista de tags',
    description: 'Veja todas as tags existentes com a quantidade de posts associados. Use o botão para excluir.',
  },
];

export function TagsTutorial() {
  const tutorial = usePageTutorial({ pageId: 'tags', steps });

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
