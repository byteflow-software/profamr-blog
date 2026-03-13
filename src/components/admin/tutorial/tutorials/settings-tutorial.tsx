'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'form',
    selector: '[data-tutorial="settings-form"]',
    title: 'Configurações do site',
    description: 'Defina o nome, slogan, logo e favicon do seu site.',
  },
  {
    id: 'social',
    selector: '[data-tutorial="settings-social"]',
    title: 'Links sociais',
    description: 'Adicione e gerencie os links das redes sociais exibidos no site.',
  },
];

export function SettingsTutorial() {
  const tutorial = usePageTutorial({ pageId: 'settings', steps });

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
