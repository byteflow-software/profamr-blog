# Plano: Melhorar Experiência de Categorias com Drag-and-Drop

## Contexto Atual

- **Modelo de dados**: Já suporta hierarquia com `parentId` (self-referencing)
- **Interface atual**: Tabela simples com dropdown para selecionar categoria pai
- **Problema**: Não há visualização hierárquica nem forma intuitiva de reorganizar

## Objetivo

Criar uma interface de gerenciamento de categorias com:
1. Visualização em árvore hierárquica
2. Drag-and-drop para aninhar/reorganizar categorias
3. Script para reorganizar categorias existentes baseado em padrões de nome

---

## Implementação

### 1. Instalar dependência de drag-and-drop

Usar `@dnd-kit` - biblioteca moderna, leve e acessível para React 19.

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Justificativa**: @dnd-kit é a biblioteca mais recomendada atualmente, com suporte a árvores hierárquicas e excelente performance.

---

### 2. Criar componente `CategoryTree`

**Arquivo**: `src/app/admin/categorias/CategoryTree.tsx`

Funcionalidades:
- Exibir categorias em formato de árvore com indentação visual
- Permitir expandir/colapsar subcategorias
- Drag-and-drop para:
  - Reordenar categorias no mesmo nível
  - Mover categoria para dentro de outra (tornar filha)
  - Mover categoria para raiz
- Indicadores visuais de drop zones (como filha ou irmã)
- Ícones de pasta/documento para diferenciar categorias com/sem filhos

---

### 3. Criar componente `CategoryTreeItem`

**Arquivo**: `src/app/admin/categorias/CategoryTreeItem.tsx`

- Item individual da árvore
- Handle de arraste (grip icon)
- Botão expandir/colapsar
- Nome da categoria + contagem de posts
- Ações inline (editar, excluir)

---

### 4. Adicionar action para atualizar hierarquia em lote

**Arquivo**: `src/app/admin/categorias/actions.ts`

Nova action `updateCategoryHierarchy`:

```typescript
interface CategoryHierarchyUpdate {
  id: number
  parentId: number | null
  order: number  // para ordenação futura se necessário
}

export async function updateCategoryHierarchy(updates: CategoryHierarchyUpdate[])
```

- Recebe array de atualizações
- Atualiza todas as categorias em uma transação
- Valida que não há ciclos (categoria não pode ser filha de si mesma ou de um descendente)

---

### 5. Refatorar página de categorias

**Arquivo**: `src/app/admin/categorias/page.tsx`

Mudanças:
- Substituir tabela por `CategoryTree`
- Manter formulário de criação na lateral
- Adicionar botão "Expandir Tudo" / "Colapsar Tudo"

---

### 6. Atualizar CSS

**Arquivo**: `src/app/admin/categorias/page.module.css`

Adicionar estilos para:
- Itens da árvore com indentação
- Estados de drag (arrastando, over)
- Drop indicators
- Animações suaves

---

### 7. Script de reorganização de categorias

**Arquivo**: `scripts/reorganize-categories.ts`

Script interativo que:
1. Lista todas as categorias existentes
2. Permite definir regras de aninhamento (ex: "Direito Civil" como pai de categorias que começam com "Civil -")
3. Ou modo interativo onde o usuário confirma cada reorganização
4. Executa as atualizações no banco

Exemplo de uso:
```bash
npx tsx scripts/reorganize-categories.ts
```

---

## Estrutura de Arquivos

```
src/app/admin/categorias/
├── page.tsx              (refatorar)
├── page.module.css       (adicionar estilos)
├── actions.ts            (adicionar updateCategoryHierarchy)
├── CategoryForm.tsx      (manter)
├── CategoryTree.tsx      (novo)
├── CategoryTreeItem.tsx  (novo)
└── DeleteCategoryButton.tsx (manter)

scripts/
└── reorganize-categories.ts (novo)
```

---

## Fluxo de UX

1. Usuário vê categorias em árvore hierárquica
2. Para aninhar: arrasta categoria A e solta sobre categoria B
   - Indicador visual mostra que A se tornará filha de B
3. Para mover para raiz: arrasta para área de "raiz" no topo
4. Para reordenar: arrasta entre categorias do mesmo nível
5. Ao soltar, sistema atualiza `parentId` via server action
6. Árvore re-renderiza com nova estrutura

---

## Validações Importantes

- Impedir ciclos (A pai de B, B pai de A)
- Impedir que categoria seja pai de si mesma
- Manter integridade dos posts associados (não afeta)
- Cascata visual: ao mover pai, filhos acompanham

---

## Ordem de Implementação

1. Instalar @dnd-kit
2. Criar action `updateCategoryHierarchy`
3. Criar `CategoryTreeItem` (componente base)
4. Criar `CategoryTree` (container com dnd-kit)
5. Atualizar página principal
6. Adicionar estilos CSS
7. Criar script de reorganização
8. Testar cenários de drag-and-drop

---

## Considerações Técnicas

- Usar `useSortable` do @dnd-kit para cada item
- Usar `DndContext` com `SortableContext` para container
- Estado local otimista durante drag, confirmar com server action
- Tratar erros e fazer rollback visual se necessário
