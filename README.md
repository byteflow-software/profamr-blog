# Prof. AMR - Blog Jurídico

Blog moderno em Next.js 15 com seção Wiki separada, tema claro e elegante para área jurídica.

## Funcionalidades

- **Blog**: Artigos jurídicos com categorias, tags e sistema de busca
- **Wiki Jurídica**: Enciclopédia de termos e conceitos do Direito
- **Design Responsivo**: Interface limpa e moderna para leitura confortável
- **Migração WordPress**: Script para importar dados do WordPress/MySQL

## Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **Prisma** - ORM moderno
- **CSS Modules** - Estilização isolada

## Instalação

### 1. Clone o repositório

```bash
git clone <repo-url>
cd profamr-blog
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do PostgreSQL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/profamr_blog?schema=public"
```

### 4. Inicialize o banco de dados

```bash
# Gera o cliente Prisma
npm run db:generate

# Aplica o schema no banco
npm run db:push
```

### 5. Migre dados do WordPress (opcional)

Se você tem o dump SQL do WordPress em `backup-database/`:

```bash
npm run migrate:wp
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
profamr-blog/
├── backup-database/       # Dump SQL do WordPress
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
├── scripts/
│   └── migrate-wordpress.ts  # Script de migração
├── src/
│   ├── app/               # Páginas (App Router)
│   │   ├── blog/          # Seção do blog
│   │   ├── wiki/          # Seção da wiki
│   │   └── page.tsx       # Página inicial
│   ├── components/        # Componentes React
│   │   ├── blog/          # Componentes do blog
│   │   └── layout/        # Header, Footer
│   └── lib/               # Utilitários
│       ├── prisma.ts      # Cliente Prisma
│       └── utils.ts       # Funções auxiliares
└── package.json
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run db:generate` | Gera cliente Prisma |
| `npm run db:push` | Aplica schema no banco |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run migrate:wp` | Importa dados do WordPress |

## Customização do Tema

As variáveis CSS estão em `src/app/globals.css`:

```css
:root {
  /* Cores principais */
  --color-primary: #1e3a5f;
  --color-secondary: #c9a227;

  /* Fontes */
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Merriweather', serif;
}
```

## Deploy

### Vercel (Recomendado)

1. Conecte o repositório na Vercel
2. Configure a variável `DATABASE_URL` nas configurações
3. Deploy automático a cada push

### Docker

```bash
# Build da imagem
docker build -t profamr-blog .

# Execução
docker run -p 3000:3000 profamr-blog
```

## Licença

MIT
