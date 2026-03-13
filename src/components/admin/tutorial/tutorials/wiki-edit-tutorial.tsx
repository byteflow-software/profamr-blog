'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  { id: 'title', selector: '[data-tutorial="wiki-title"]', title: 'Editar título', description: 'Modifique o título do artigo wiki.' },
  { id: 'editor', selector: '[data-tutorial="wiki-editor"]', title: 'Editar conteúdo', description: 'Atualize o conteúdo do artigo no editor.' },
  { id: 'category', selector: '[data-tutorial="wiki-category"]', title: 'Categoria', description: 'Altere a categoria do artigo se necessário.' },
  { id: 'status', selector: '[data-tutorial="wiki-status"]', title: 'Alterar status', description: 'Mude entre Rascunho e Publicado.' },
  { id: 'save', selector: '[data-tutorial="wiki-save"]', title: 'Salvar alterações', description: 'Clique para salvar as modificações.' },
];

export function WikiEditTutorial() {
  const tutorial = usePageTutorial({ pageId: 'wiki-edit', steps });
  return (
    <>
      <TutorialOverlay isActive={tutorial.isActive} step={tutorial.currentStep} stepIndex={tutorial.stepIndex} totalSteps={tutorial.totalSteps} onNext={tutorial.handleNext} onDismiss={tutorial.dismissTutorial} />
      {!tutorial.isActive && <TutorialTriggerButton onClick={tutorial.startTutorial} />}
    </>
  );
}
