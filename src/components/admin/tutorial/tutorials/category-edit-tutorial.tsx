'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  { id: 'form', selector: '[data-tutorial="cat-edit-form"]', title: 'Editar categoria', description: 'Modifique o nome, slug, descrição e categoria pai.' },
];

export function CategoryEditTutorial() {
  const tutorial = usePageTutorial({ pageId: 'category-edit', steps });
  return (
    <>
      <TutorialOverlay isActive={tutorial.isActive} step={tutorial.currentStep} stepIndex={tutorial.stepIndex} totalSteps={tutorial.totalSteps} onNext={tutorial.handleNext} onDismiss={tutorial.dismissTutorial} />
      {!tutorial.isActive && <TutorialTriggerButton onClick={tutorial.startTutorial} />}
    </>
  );
}
