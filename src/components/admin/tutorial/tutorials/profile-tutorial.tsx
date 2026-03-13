'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'form',
    selector: '[data-tutorial="profile-form"]',
    title: 'Seu perfil',
    description: 'Edite seu nome de exibição, biografia e URL do avatar.',
  },
  {
    id: 'stats',
    selector: '[data-tutorial="profile-stats"]',
    title: 'Suas estatísticas',
    description: 'Veja a quantidade de posts e artigos wiki que você criou.',
  },
];

export function ProfileTutorial() {
  const tutorial = usePageTutorial({ pageId: 'profile', steps });

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
