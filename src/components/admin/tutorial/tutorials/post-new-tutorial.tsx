'use client';

import { TutorialOverlay, TutorialTriggerButton, usePageTutorial } from '../index';
import type { TutorialOverlayStep } from '../index';

const steps: TutorialOverlayStep[] = [
  { id: 'title', selector: '[data-tutorial="post-title"]', title: 'Título do post', description: 'Digite o título do seu post. O slug (URL) será gerado automaticamente.' },
  { id: 'slug', selector: '[data-tutorial="post-slug"]', title: 'Slug (URL)', description: 'O endereço do post na web. É gerado pelo título mas pode ser editado manualmente.' },
  { id: 'editor', selector: '[data-tutorial="post-editor"]', title: 'Editor de conteúdo', description: 'Escreva o conteúdo do post usando o editor rich text. Suporta formatação, imagens e código.' },
  { id: 'image', selector: '[data-tutorial="post-image"]', title: 'Imagem destacada', description: 'Selecione uma imagem da biblioteca de mídia para ser a capa do post.' },
  { id: 'status', selector: '[data-tutorial="post-status"]', title: 'Status', description: 'Defina como Rascunho para salvar sem publicar, ou Publicado para tornar visível no site.' },
  { id: 'categories', selector: '[data-tutorial="post-categories"]', title: 'Categorias', description: 'Selecione uma ou mais categorias para organizar o post.' },
  { id: 'tags', selector: '[data-tutorial="post-tags"]', title: 'Tags', description: 'Adicione tags para facilitar a busca e navegação.' },
  { id: 'save', selector: '[data-tutorial="post-save"]', title: 'Salvar', description: 'Clique para salvar o post. Você pode voltar para editá-lo depois.' },
];

export function PostNewTutorial() {
  const tutorial = usePageTutorial({ pageId: 'post-new', steps });
  return (
    <>
      <TutorialOverlay isActive={tutorial.isActive} step={tutorial.currentStep} stepIndex={tutorial.stepIndex} totalSteps={tutorial.totalSteps} onNext={tutorial.handleNext} onDismiss={tutorial.dismissTutorial} />
      {!tutorial.isActive && <TutorialTriggerButton onClick={tutorial.startTutorial} />}
    </>
  );
}
