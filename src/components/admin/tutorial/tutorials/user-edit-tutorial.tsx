'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  { id: 'form', selector: '[data-tutorial="user-edit-form"]', title: 'Editar usuário', description: 'Modifique o nome, função e biografia do usuário. O email não pode ser alterado.' },
];

export function UserEditTutorial() {
  const tutorial = usePageTutorial({ pageId: 'user-edit', steps });
  return (
    <>
      <TutorialOverlay isActive={tutorial.isActive} step={tutorial.currentStep} stepIndex={tutorial.stepIndex} totalSteps={tutorial.totalSteps} onNext={tutorial.handleNext} onDismiss={tutorial.dismissTutorial} />
      {!tutorial.isActive && <TutorialTriggerButton onClick={tutorial.startTutorial} />}
    </>
  );
}
