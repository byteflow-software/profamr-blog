'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  { id: 'title', selector: '[data-tutorial="wiki-title"]', title: 'Título do artigo', description: 'Digite o título do artigo wiki. O slug será gerado automaticamente.' },
  { id: 'editor', selector: '[data-tutorial="wiki-editor"]', title: 'Editor de conteúdo', description: 'Escreva o conteúdo do artigo usando o editor rich text.' },
  { id: 'summary', selector: '[data-tutorial="wiki-summary"]', title: 'Resumo', description: 'Adicione um resumo curto do artigo (opcional). Aparece na listagem da wiki.' },
  { id: 'category', selector: '[data-tutorial="wiki-category"]', title: 'Categoria', description: 'Selecione a categoria para classificar o artigo na wiki.' },
  { id: 'parent', selector: '[data-tutorial="wiki-parent"]', title: 'Artigo pai', description: 'Selecione um artigo pai para criar hierarquia (opcional).' },
  { id: 'status', selector: '[data-tutorial="wiki-status"]', title: 'Status', description: 'Defina como Rascunho ou Publicado.' },
  { id: 'save', selector: '[data-tutorial="wiki-save"]', title: 'Salvar', description: 'Clique para salvar o artigo wiki.' },
];

export function WikiNewTutorial() {
  const tutorial = usePageTutorial({ pageId: 'wiki-new', steps });
  return (
    <>
      <TutorialOverlay isActive={tutorial.isActive} step={tutorial.currentStep} stepIndex={tutorial.stepIndex} totalSteps={tutorial.totalSteps} onNext={tutorial.handleNext} onDismiss={tutorial.dismissTutorial} />
      {!tutorial.isActive && <TutorialTriggerButton onClick={tutorial.startTutorial} />}
    </>
  );
}
