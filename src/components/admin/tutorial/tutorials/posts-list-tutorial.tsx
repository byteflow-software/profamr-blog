'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'new-btn',
    selector: '[data-tutorial="posts-new-btn"]',
    title: 'Criar novo post',
    description: 'Clique aqui para criar um novo post no blog.',
  },
  {
    id: 'filter-tabs',
    selector: '[data-tutorial="posts-filter-tabs"]',
    title: 'Filtros de status',
    description: 'Filtre os posts por status: todos, publicados ou rascunhos.',
  },
  {
    id: 'search',
    selector: '[data-tutorial="posts-search"]',
    title: 'Busca',
    description: 'Pesquise posts pelo título ou conteúdo.',
  },
  {
    id: 'table',
    selector: '[data-tutorial="posts-table"]',
    title: 'Lista de posts',
    description: 'Veja todos os posts aqui. Clique nos cabeçalhos das colunas para ordenar. Use os botões de ação para editar ou excluir.',
  },
  {
    id: 'pagination',
    selector: '[data-tutorial="posts-pagination"]',
    title: 'Paginação',
    description: 'Navegue entre as páginas de resultados.',
  },
];

export function PostsListTutorial() {
  const tutorial = usePageTutorial({ pageId: 'posts-list', steps });

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
