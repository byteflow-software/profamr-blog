'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'form',
    selector: '[data-tutorial="wiki-category-form"]',
    title: 'Criar categoria wiki',
    description: 'Preencha o nome, descrição e ícone para criar uma nova categoria na wiki.',
  },
  {
    id: 'tree',
    selector: '[data-tutorial="wiki-category-tree"]',
    title: 'Árvore de categorias',
    description: 'Veja a hierarquia das categorias wiki. Clique para editar ou excluir.',
  },
];

export function WikiCategoriesTutorial() {
  const tutorial = usePageTutorial({ pageId: 'wiki-categories', steps });

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
