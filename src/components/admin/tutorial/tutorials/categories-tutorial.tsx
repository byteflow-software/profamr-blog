'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'form',
    selector: '[data-tutorial="category-form"]',
    title: 'Criar categoria',
    description: 'Preencha o nome e selecione uma categoria pai (opcional) para criar uma nova categoria.',
  },
  {
    id: 'tree',
    selector: '[data-tutorial="category-tree"]',
    title: 'Árvore de categorias',
    description: 'Visualize a hierarquia de categorias. Arraste e solte para reorganizar. Clique para editar ou excluir.',
  },
];

export function CategoriesTutorial() {
  const tutorial = usePageTutorial({ pageId: 'categories', steps });

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
