'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'new-btn',
    selector: '[data-tutorial="wiki-new-btn"]',
    title: 'Criar artigo wiki',
    description: 'Clique aqui para criar um novo artigo na wiki jurídica.',
  },
  {
    id: 'categories-link',
    selector: '[data-tutorial="wiki-categories-link"]',
    title: 'Categorias da wiki',
    description: 'Acesse a gestão de categorias da wiki para organizar seus artigos.',
  },
  {
    id: 'filter-tabs',
    selector: '[data-tutorial="wiki-filter-tabs"]',
    title: 'Filtros',
    description: 'Filtre artigos por status: todos, publicados ou rascunhos.',
  },
  {
    id: 'category-filter',
    selector: '[data-tutorial="wiki-category-filter"]',
    title: 'Filtro por categoria',
    description: 'Filtre artigos por categoria específica da wiki.',
  },
  {
    id: 'table',
    selector: '[data-tutorial="wiki-table"]',
    title: 'Lista de artigos',
    description: 'Todos os artigos wiki com opções de ordenação, edição e exclusão.',
  },
];

export function WikiListTutorial() {
  const tutorial = usePageTutorial({ pageId: 'wiki-list', steps });

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
