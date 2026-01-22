# Prof AMR 2.0 - WordPress Theme

Um tema WordPress moderno e responsivo desenvolvido especialmente para o site [profamr.app](https://profamr.app), focado em tecnologia jurídica, OSINT, recursos educacionais e sistema de Wiki integrado.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Tema](#estrutura-do-tema)
- [Personalização](#personalização)
- [Custom Post Types](#custom-post-types)
- [Widgets](#widgets)
- [Menus](#menus)
- [Suporte](#suporte)

## 🎯 Visão Geral

O **Prof AMR 2.0** é um tema WordPress profissional criado do zero para atender às necessidades específicas de um site educacional focado em tecnologia jurídica, ferramentas OSINT, tutoriais e documentação em formato Wiki.

### Principais Melhorias da Versão 2.0:

- ✨ Design moderno e profissional
- 📱 Totalmente responsivo
- 🚀 Otimizado para performance
- 🔍 SEO-friendly
- ♿ Acessível (WCAG 2.1)
- 🎨 Sistema de cores customizável
- 📚 Sistema de Wiki completo
- 🛠️ Custom Post Types para ferramentas e recursos

## ✨ Características

### Design & UI/UX

- Design limpo e moderno com foco em legibilidade
- Paleta de cores profissional e customizável
- Tipografia otimizada para leitura
- Animações suaves e transições elegantes
- Modo escuro automático (respeitando preferências do sistema)
- Cards de posts com hover effects
- Breadcrumbs e navegação intuitiva

### Performance

- CSS e JavaScript otimizados
- Lazy loading de imagens
- Minificação de assets
- Remoção de scripts desnecessários do WordPress
- Suporte a cache
- Schema.org markup para SEO
- Meta tags Open Graph e Twitter Cards

### Funcionalidades Interativas

- Menu mobile responsivo
- Barra de progresso de leitura
- Botão "Voltar ao topo"
- Tabela de conteúdo automática em artigos Wiki
- Botão de copiar código em blocos de código
- Smooth scroll para links âncora
- Busca integrada

### Sistema de Wiki

- Custom Post Type dedicado para Wiki
- Taxonomias personalizadas (Categorias e Tags)
- Template especial para artigos Wiki
- Sistema de artigos relacionados
- Sidebar específica para Wiki
- Visual diferenciado com badges
- Suporte a hierarquia de páginas

### Recursos Adicionais

- Widgets customizados para Wiki
- 3 áreas de widgets no footer
- Sidebar principal e sidebar Wiki
- Suporte completo ao Gutenberg
- Suporte a imagens destacadas
- Sistema de comentários threaded
- Navegação entre posts/artigos
- Páginas de arquivo customizadas
- Página 404 personalizada

## 📋 Requisitos

- WordPress 6.0 ou superior
- PHP 7.4 ou superior
- MySQL 5.6 ou superior

## 💾 Instalação

### Instalação Manual

1. Faça download do tema ou clone o repositório:
```bash
git clone https://github.com/byteflow-software/profamr-blog.git
```

2. Navegue até a pasta do tema:
```bash
cd profamr-blog/profamr-theme
```

3. Comprima a pasta do tema em um arquivo ZIP (se necessário)

4. No painel do WordPress, vá em **Aparência > Temas > Adicionar Novo > Enviar Tema**

5. Selecione o arquivo ZIP e clique em **Instalar Agora**

6. Após a instalação, clique em **Ativar**

### Instalação via FTP

1. Faça upload da pasta `profamr-theme` para `/wp-content/themes/` no seu servidor

2. No painel do WordPress, vá em **Aparência > Temas**

3. Localize o tema "Prof AMR 2.0" e clique em **Ativar**

## 🚀 Funcionalidades

### Custom Post Types

#### Wiki
- **Slug**: `/wiki/`
- **Funcionalidade**: Artigos de documentação e tutoriais
- **Taxonomias**:
  - Wiki Categories (Categorias)
  - Wiki Tags (Tags)
- **Suporte**: Editor, Thumbnail, Comentários, Hierarquia

#### Tools
- **Slug**: `/tools/`
- **Funcionalidade**: Catálogo de ferramentas OSINT e aplicativos
- **Taxonomias**: Tool Types (Tipos de Ferramenta)
- **Suporte**: Editor, Thumbnail, Comentários

### Taxonomias

#### Wiki Categories (Categorias da Wiki)
Categorias pré-definidas:
- OSINT
- Security
- Legal Tech
- Tools
- Tutorials

#### Tool Types (Tipos de Ferramenta)
- OSINT
- Analysis
- Web
- AI/ML
- Productivity

## 🎨 Personalização

### Customizer

Acesse **Aparência > Personalizar** para ajustar:

#### Prof AMR Options
- **Primary Color**: Cor principal do tema
- **Secondary Color**: Cor secundária
- **Show Reading Time**: Exibir tempo de leitura
- **Show Author**: Exibir autor dos posts
- **Show Post Date**: Exibir data de publicação
- **Footer Text**: Texto do rodapé

#### Social Media Links
- Twitter URL
- LinkedIn URL
- GitHub URL
- Email Address

### CSS Customizado

Para adicionar estilos personalizados, use **Aparência > Personalizar > CSS Adicional**

### Variáveis CSS

O tema usa CSS Variables para fácil customização:

```css
:root {
    --color-primary: #2563eb;
    --color-secondary: #059669;
    --color-accent: #f59e0b;
    --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    --font-heading: 'Inter', sans-serif;
    --spacing-md: 1rem;
    --radius-md: 0.5rem;
}
```

## 📦 Widgets

### Widgets Customizados

#### Recent Wiki Articles
Exibe artigos recentes da Wiki com opção de definir quantidade.

#### Wiki Categories
Lista as categorias da Wiki com contagem de artigos.

### Áreas de Widgets

1. **Main Sidebar**: Sidebar principal do blog
2. **Wiki Sidebar**: Sidebar específica para páginas Wiki
3. **Footer Widget Area 1-3**: Três colunas no rodapé

## 🧭 Menus

O tema suporta 3 localizações de menu:

1. **Primary Menu**: Menu principal no header
2. **Footer Menu**: Menu no rodapé
3. **Wiki Menu**: Menu específico para navegação da Wiki

Configure em **Aparência > Menus**

## 📁 Estrutura do Tema

```
profamr-theme/
├── assets/
│   ├── css/
│   │   └── main.css          # Estilos adicionais
│   ├── js/
│   │   └── main.js           # Scripts interativos
│   └── images/               # Imagens do tema
├── inc/
│   ├── custom-post-types.php # Definição de CPTs
│   ├── taxonomies.php        # Taxonomias customizadas
│   ├── widgets.php           # Widgets personalizados
│   └── customizer.php        # Configurações do Customizer
├── template-parts/
│   ├── content.php           # Template para posts
│   ├── content-wiki.php      # Template para Wiki
│   └── content-none.php      # Template para "nada encontrado"
├── 404.php                   # Página de erro 404
├── archive.php               # Arquivo de categorias/tags
├── comments.php              # Template de comentários
├── footer.php                # Rodapé
├── functions.php             # Funções do tema
├── header.php                # Cabeçalho
├── index.php                 # Template principal
├── page.php                  # Template de páginas
├── search.php                # Resultados de busca
├── sidebar.php               # Sidebar padrão
├── single.php                # Posts individuais
├── single-wiki.php           # Artigos Wiki individuais
└── style.css                 # Folha de estilos principal
```

## 🎯 Casos de Uso

### Criar um Artigo Wiki

1. No painel do WordPress, vá em **Wiki > Adicionar Novo**
2. Digite o título e conteúdo
3. Selecione categorias e tags da Wiki
4. Adicione uma imagem destacada (recomendado: 800x450px)
5. Publique

### Adicionar uma Ferramenta

1. Vá em **Tools > Adicionar Novo**
2. Preencha informações da ferramenta
3. Selecione o tipo de ferramenta
4. Adicione links e recursos
5. Publique

### Personalizar Cores

1. Vá em **Aparência > Personalizar > Prof AMR Options**
2. Ajuste a cor primária e secundária
3. Clique em **Publicar** para salvar

## 🔧 Desenvolvimento

### Requisitos de Desenvolvimento

- Node.js 14+ (se usar build tools)
- Git

### Estrutura de Desenvolvimento

O tema foi desenvolvido seguindo as melhores práticas do WordPress:

- Padrões de codificação WordPress
- Funções escapadas para segurança
- Internacionalização (i18n) pronta
- Código documentado
- Performance otimizada

## 📝 Changelog

### Versão 2.0.0 (2026-01-22)

#### Novidades
- ✨ Design completamente redesenhado
- 📚 Sistema de Wiki integrado
- 🛠️ Custom Post Type para ferramentas
- 🎨 Sistema de cores customizável via Customizer
- 📱 Design responsivo aprimorado
- 🚀 Performance otimizada
- ♿ Melhorias de acessibilidade
- 🔍 SEO aprimorado com Schema.org
- 📊 Barra de progresso de leitura
- 📑 Tabela de conteúdo automática
- 💬 Sistema de comentários melhorado
- 🎯 Widgets customizados
- 🔗 Links de redes sociais no rodapé
- 📸 Suporte completo a imagens
- 🎬 Animações e transições suaves

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este tema é licenciado sob a GNU General Public License v2 ou posterior.

## 👨‍💻 Autor

**Prof. Alexandre Morais da Rosa**
- Website: [profamr.app](https://profamr.app)

## 🆘 Suporte

Para suporte, questões ou sugestões:
- Abra uma issue no GitHub
- Entre em contato através do site

---

Desenvolvido com ❤️ para a comunidade de tecnologia jurídica e OSINT.
