'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  {
    id: 'upload',
    selector: '[data-tutorial="media-upload"]',
    title: 'Enviar arquivos',
    description: 'Arraste e solte arquivos aqui ou clique para selecionar. Suporta imagens e vídeos.',
  },
  {
    id: 'type-filters',
    selector: '[data-tutorial="media-type-filters"]',
    title: 'Filtros por tipo',
    description: 'Filtre a biblioteca por tipo de mídia: imagens, vídeos ou todos.',
  },
  {
    id: 'search',
    selector: '[data-tutorial="media-search"]',
    title: 'Buscar mídia',
    description: 'Pesquise arquivos pelo nome ou descrição.',
  },
  {
    id: 'grid',
    selector: '[data-tutorial="media-grid"]',
    title: 'Biblioteca de mídia',
    description: 'Todos os seus arquivos em grade. Clique para editar metadados ou excluir.',
  },
];

export function MediaTutorial() {
  const tutorial = usePageTutorial({ pageId: 'media-library', steps });

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
