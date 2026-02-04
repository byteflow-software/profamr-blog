# Plano: Área Administrativa do Prof.AMR Blog

## Visão Geral

Criar uma área administrativa completa inspirada no WordPress, com autenticação de alta segurança, para gerenciar todo o conteúdo do blog.

---

## 1. Autenticação de Alta Segurança

### Tecnologias
- **NextAuth.js v5** (Auth.js) - Framework de autenticação para Next.js
- **bcrypt** - Hash de senhas com salt
- **speakeasy + qrcode** - Autenticação de dois fatores (2FA/TOTP)

### Funcionalidades de Segurança
- Senhas com hash bcrypt (cost factor 12)
- Autenticação de dois fatores (2FA) via app autenticador (Google Authenticator, Authy)
- Rate limiting (máximo 5 tentativas de login por 15 minutos)
- Bloqueio de conta após 10 tentativas falhas
- Sessões JWT com expiração de 24h (renovável)
- Cookies httpOnly + secure + sameSite
- Registro de logs de acesso (IP, user agent, timestamp)
- Redefinição de senha via email com token temporário

### Alterações no Schema Prisma

```prisma
model User {
  // Campos existentes...

  // Novos campos de autenticação
  passwordHash    String?   @map("password_hash")
  role            UserRole  @default(AUTHOR)
  twoFactorSecret String?   @map("two_factor_secret")
  twoFactorEnabled Boolean  @default(false) @map("two_factor_enabled")
  failedAttempts  Int       @default(0) @map("failed_attempts")
  lockedUntil     DateTime? @map("locked_until")
  lastLoginAt     DateTime? @map("last_login_at")
  lastLoginIp     String?   @map("last_login_ip")
}

enum UserRole {
  ADMIN       // Acesso total
  EDITOR      // Pode editar/publicar qualquer conteúdo
  AUTHOR      // Pode criar/editar próprios posts
}

model Session {
  id           String   @id @default(cuid())
  userId       Int      @map("user_id")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  expiresAt    DateTime @map("expires_at")
  userAgent    String?  @map("user_agent")
  ipAddress    String?  @map("ip_address")
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("sessions")
}

model LoginLog {
  id        Int      @id @default(autoincrement())
  userId    Int?     @map("user_id")
  email     String
  success   Boolean
  ipAddress String   @map("ip_address")
  userAgent String?  @map("user_agent")
  reason    String?  // "invalid_password", "2fa_failed", "account_locked"
  createdAt DateTime @default(now()) @map("created_at")

  @@map("login_logs")
}
```

---

## 2. Estrutura de Rotas do Admin

```
src/app/admin/
├── layout.tsx              # Layout admin com sidebar
├── page.tsx                # Dashboard principal
├── login/
│   └── page.tsx            # Tela de login
├── setup-2fa/
│   └── page.tsx            # Configurar autenticação 2FA
├── posts/
│   ├── page.tsx            # Listagem de posts
│   ├── novo/page.tsx       # Criar novo post
│   └── [id]/page.tsx       # Editar post
├── categorias/
│   ├── page.tsx            # Gerenciar categorias
│   └── [id]/page.tsx       # Editar categoria
├── tags/
│   └── page.tsx            # Gerenciar tags
├── wiki/
│   ├── page.tsx            # Listagem artigos wiki
│   ├── novo/page.tsx       # Criar artigo wiki
│   ├── [id]/page.tsx       # Editar artigo wiki
│   └── categorias/
│       └── page.tsx        # Categorias da wiki
├── usuarios/
│   ├── page.tsx            # Listagem de usuários (ADMIN only)
│   └── [id]/page.tsx       # Editar usuário
├── configuracoes/
│   └── page.tsx            # Configurações do site
└── perfil/
    └── page.tsx            # Perfil do usuário logado
```

---

## 3. Componentes do Admin

### Layout e Navegação
- `AdminLayout` - Layout com sidebar colapsável
- `AdminSidebar` - Menu lateral com navegação
- `AdminHeader` - Barra superior com usuário logado
- `AdminBreadcrumb` - Navegação em migalhas

### UI Reutilizáveis
- `DataTable` - Tabela com ordenação, busca e paginação
- `FormField` - Campo de formulário com label e erro
- `RichTextEditor` - Editor de texto rico (TipTap ou similar)
- `ImageUpload` - Upload de imagens com preview
- `Modal` - Modal de confirmação/dialogo
- `Toast` - Notificações toast
- `Badge` - Status badges (rascunho, publicado, etc)
- `StatsCard` - Cards de estatísticas do dashboard

### Formulários Específicos
- `PostForm` - Formulário de criação/edição de posts
- `WikiArticleForm` - Formulário para artigos wiki
- `CategoryForm` - Formulário de categorias
- `UserForm` - Formulário de usuários
- `SettingsForm` - Formulário de configurações

---

## 4. Dashboard Principal

O dashboard mostrará:
- **Cards de estatísticas**: Total de posts, artigos wiki, views, usuários
- **Posts recentes**: Lista dos últimos 5 posts com status
- **Artigos wiki recentes**: Lista dos últimos 5 artigos
- **Gráfico de views**: Visualizações dos últimos 30 dias (opcional)
- **Atividade recente**: Logs de alterações recentes

---

## 5. Funcionalidades por Seção

### Posts
- Listagem com filtros (status, categoria, autor)
- Busca por título
- Ordenação por data, views
- Criação com editor rico
- Preview antes de publicar
- Agendar publicação
- Duplicar post
- Excluir (soft delete ou confirmação)

### Categorias
- Árvore hierárquica de categorias
- Drag & drop para reorganizar
- Contagem de posts por categoria

### Wiki
- Similar aos posts
- Suporte a hierarquia pai/filho
- Ordenação manual (order field)

### Usuários (Admin only)
- Criar/editar usuários
- Definir roles
- Resetar senha
- Forçar ativação de 2FA
- Visualizar logs de login

### Configurações
- Nome/tagline do site
- Upload de logo/favicon
- Texto "sobre"
- Links de redes sociais

---

## 6. Dependências a Instalar

```bash
pnpm add next-auth@beta bcryptjs speakeasy qrcode
pnpm add -D @types/bcryptjs @types/speakeasy @types/qrcode
```

Opcional para editor rico:
```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

---

## 7. Ordem de Implementação

### Fase 1: Autenticação
1. Atualizar schema Prisma com campos de auth
2. Criar migration e gerar client
3. Implementar NextAuth com Credentials provider
4. Criar página de login
5. Implementar middleware de proteção de rotas
6. Adicionar 2FA (opcional mas recomendado)

### Fase 2: Layout Admin
1. Criar layout base do admin
2. Sidebar com navegação
3. Header com usuário logado
4. Componentes UI base (DataTable, FormField, Modal, Toast)

### Fase 3: Dashboard
1. Página inicial com estatísticas
2. Listagens resumidas

### Fase 4: Gestão de Posts
1. Listagem de posts
2. Formulário de criação/edição
3. Editor de texto rico
4. Upload de imagens

### Fase 5: Gestão de Categorias/Tags
1. CRUD de categorias
2. CRUD de tags
3. Interface hierárquica

### Fase 6: Gestão de Wiki
1. Listagem de artigos
2. Formulário de criação/edição
3. Categorias da wiki
4. Hierarquia pai/filho

### Fase 7: Usuários e Configurações
1. Gestão de usuários (admin)
2. Página de perfil
3. Configurações do site

---

## 8. Estimativa de Arquivos

- ~15 páginas em `src/app/admin/`
- ~20 componentes em `src/components/admin/`
- ~5 arquivos em `src/lib/` (auth, admin utils)
- ~3 API routes em `src/app/api/`
- Atualizações no schema Prisma

---

## Considerações de Segurança Extras

1. **CSRF**: NextAuth já inclui proteção CSRF
2. **XSS**: Sanitização de HTML no editor rico
3. **SQL Injection**: Prisma já protege via parameterized queries
4. **Senhas**: Mínimo 8 caracteres, 1 maiúscula, 1 número
5. **Sessões**: Invalidar ao trocar senha ou ativar 2FA
6. **Logs**: Manter registro de todas ações sensíveis
