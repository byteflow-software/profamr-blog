'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  { id: 'title', selector: '[data-tutorial="post-title"]', title: 'Editar título', description: 'Modifique o título do post. O slug pode ser ajustado separadamente.' },
  { id: 'editor', selector: '[data-tutorial="post-editor"]', title: 'Editar conteúdo', description: 'Atualize o conteúdo do post no editor rich text.' },
  { id: 'status', selector: '[data-tutorial="post-status"]', title: 'Alterar status', description: 'Mude entre Rascunho, Publicado ou Arquivado conforme necessário.' },
  { id: 'categories', selector: '[data-tutorial="post-categories"]', title: 'Categorias', description: 'Ajuste as categorias do post conforme necessário.' },
  { id: 'save', selector: '[data-tutorial="post-save"]', title: 'Salvar alterações', description: 'Clique para salvar as modificações feitas no post.' },
];

export function PostEditTutorial() {
  const tutorial = usePageTutorial({ pageId: 'post-edit', steps });
  return (
    <>
      <TutorialOverlay isActive={tutorial.isActive} step={tutorial.currentStep} stepIndex={tutorial.stepIndex} totalSteps={tutorial.totalSteps} onNext={tutorial.handleNext} onDismiss={tutorial.dismissTutorial} />
      {!tutorial.isActive && <TutorialTriggerButton onClick={tutorial.startTutorial} />}
    </>
  );
}
