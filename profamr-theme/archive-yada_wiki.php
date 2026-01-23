<?php
/**
 * Template for displaying yada_wiki archive with filters
 *
 * @package Prof_AMR_News
 * @since 2.0.0
 */

get_header();
?>

<div id="primary" class="content-area wiki-archive-modern">
    <div class="wiki-container">
        <!-- Wiki Header -->
        <header class="wiki-header">
            <h1 class="wiki-title">
                <span class="wiki-icon">📚</span>
                <?php esc_html_e( 'Wikipédia do Prof. AMR', 'prof-amr-news' ); ?>
            </h1>
            <p class="wiki-description">
                <?php esc_html_e( 'Base de conhecimento sobre tecnologia jurídica, OSINT, processos penais e ferramentas digitais.', 'prof-amr-news' ); ?>
            </p>
        </header>

        <!-- Wiki Filters -->
        <div class="wiki-filters">
            <div class="wiki-filters-inner">
                <!-- Search Filter -->
                <div class="wiki-filter-search">
                    <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="wiki-search-form">
                        <input type="hidden" name="post_type" value="yada_wiki">
                        <input type="search"
                               class="wiki-search-field"
                               placeholder="<?php esc_attr_e( 'Buscar na Wiki...', 'prof-amr-news' ); ?>"
                               value="<?php echo get_search_query(); ?>"
                               name="s">
                        <button type="submit" class="wiki-search-submit">
                            <span class="search-icon">🔍</span>
                            <?php esc_html_e( 'Buscar', 'prof-amr-news' ); ?>
                        </button>
                    </form>
                </div>

                <!-- Category Filter -->
                <?php
                $wiki_categories = get_terms( array(
                    'taxonomy'   => 'wiki_category',
                    'hide_empty' => true,
                ) );

                if ( ! empty( $wiki_categories ) && ! is_wp_error( $wiki_categories ) ) :
                    ?>
                    <div class="wiki-filter-categories">
                        <label for="wiki-category-filter" class="filter-label">
                            <span class="filter-icon">🏷️</span>
                            <?php esc_html_e( 'Categoria:', 'prof-amr-news' ); ?>
                        </label>
                        <select id="wiki-category-filter" class="wiki-category-select">
                            <option value=""><?php esc_html_e( 'Todas as categorias', 'prof-amr-news' ); ?></option>
                            <?php
                            foreach ( $wiki_categories as $category ) :
                                $selected = ( is_tax( 'wiki_category', $category->slug ) ) ? 'selected' : '';
                                ?>
                                <option value="<?php echo esc_url( get_term_link( $category ) ); ?>" <?php echo $selected; ?>>
                                    <?php echo esc_html( $category->name ); ?> (<?php echo $category->count; ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                <?php endif; ?>

                <!-- Sort Filter -->
                <div class="wiki-filter-sort">
                    <label for="wiki-sort-filter" class="filter-label">
                        <span class="filter-icon">↕️</span>
                        <?php esc_html_e( 'Ordenar:', 'prof-amr-news' ); ?>
                    </label>
                    <select id="wiki-sort-filter" class="wiki-sort-select">
                        <option value="date-desc" <?php selected( isset( $_GET['orderby'] ) && $_GET['orderby'] === 'date-desc' ); ?>>
                            <?php esc_html_e( 'Mais recentes', 'prof-amr-news' ); ?>
                        </option>
                        <option value="date-asc" <?php selected( isset( $_GET['orderby'] ) && $_GET['orderby'] === 'date-asc' ); ?>>
                            <?php esc_html_e( 'Mais antigos', 'prof-amr-news' ); ?>
                        </option>
                        <option value="title-asc" <?php selected( isset( $_GET['orderby'] ) && $_GET['orderby'] === 'title-asc' ); ?>>
                            <?php esc_html_e( 'A-Z', 'prof-amr-news' ); ?>
                        </option>
                        <option value="title-desc" <?php selected( isset( $_GET['orderby'] ) && $_GET['orderby'] === 'title-desc' ); ?>>
                            <?php esc_html_e( 'Z-A', 'prof-amr-news' ); ?>
                        </option>
                    </select>
                </div>

                <!-- View Toggle -->
                <div class="wiki-view-toggle">
                    <button class="view-toggle-btn active" data-view="grid" title="<?php esc_attr_e( 'Grade', 'prof-amr-news' ); ?>">
                        <span>⊞</span>
                    </button>
                    <button class="view-toggle-btn" data-view="list" title="<?php esc_attr_e( 'Lista', 'prof-amr-news' ); ?>">
                        <span>☰</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Active Filters Display -->
        <?php if ( is_tax( 'wiki_category' ) || is_search() ) : ?>
            <div class="active-filters">
                <?php if ( is_tax( 'wiki_category' ) ) : ?>
                    <span class="active-filter">
                        <span class="filter-label"><?php esc_html_e( 'Categoria:', 'prof-amr-news' ); ?></span>
                        <span class="filter-value"><?php single_term_title(); ?></span>
                        <a href="<?php echo esc_url( get_post_type_archive_link( 'yada_wiki' ) ); ?>" class="filter-remove">✕</a>
                    </span>
                <?php endif; ?>

                <?php if ( is_search() ) : ?>
                    <span class="active-filter">
                        <span class="filter-label"><?php esc_html_e( 'Busca:', 'prof-amr-news' ); ?></span>
                        <span class="filter-value"><?php echo get_search_query(); ?></span>
                        <a href="<?php echo esc_url( get_post_type_archive_link( 'yada_wiki' ) ); ?>" class="filter-remove">✕</a>
                    </span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <!-- Wiki Articles Grid -->
        <main id="main" class="wiki-main">
            <?php
            if ( have_posts() ) :
                ?>
                <div class="wiki-count">
                    <span class="count-number"><?php echo $wp_query->found_posts; ?></span>
                    <?php
                    printf(
                        _n( 'artigo encontrado', 'artigos encontrados', $wp_query->found_posts, 'prof-amr-news' )
                    );
                    ?>
                </div>

                <div class="wiki-articles-grid" data-view="grid">
                    <?php
                    while ( have_posts() ) :
                        the_post();
                        ?>
                        <article id="post-<?php the_ID(); ?>" <?php post_class( 'wiki-article-card' ); ?>>
                            <?php if ( has_post_thumbnail() ) : ?>
                                <div class="wiki-card-thumbnail">
                                    <a href="<?php the_permalink(); ?>">
                                        <?php the_post_thumbnail( 'medium' ); ?>
                                    </a>
                                </div>
                            <?php endif; ?>

                            <div class="wiki-card-content">
                                <?php
                                // Display categories
                                $categories = get_the_terms( get_the_ID(), 'wiki_category' );
                                if ( $categories && ! is_wp_error( $categories ) ) :
                                    ?>
                                    <div class="wiki-card-categories">
                                        <?php foreach ( $categories as $category ) : ?>
                                            <a href="<?php echo esc_url( get_term_link( $category ) ); ?>" class="wiki-category-badge">
                                                <?php echo esc_html( $category->name ); ?>
                                            </a>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; ?>

                                <header class="wiki-card-header">
                                    <h2 class="wiki-card-title">
                                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                    </h2>
                                </header>

                                <div class="wiki-card-excerpt">
                                    <?php the_excerpt(); ?>
                                </div>

                                <footer class="wiki-card-footer">
                                    <div class="wiki-card-meta">
                                        <span class="wiki-date">
                                            <span class="meta-icon">📅</span>
                                            <?php echo get_the_date(); ?>
                                        </span>
                                        <span class="wiki-modified">
                                            <span class="meta-icon">🔄</span>
                                            <?php echo get_the_modified_date(); ?>
                                        </span>
                                    </div>
                                    <a href="<?php the_permalink(); ?>" class="wiki-read-more">
                                        <?php esc_html_e( 'Ler mais', 'prof-amr-news' ); ?> →
                                    </a>
                                </footer>
                            </div>
                        </article>
                        <?php
                    endwhile;
                    ?>
                </div>

                <?php
                // Pagination
                the_posts_pagination( array(
                    'mid_size'  => 2,
                    'prev_text' => __( '← Anterior', 'prof-amr-news' ),
                    'next_text' => __( 'Próxima →', 'prof-amr-news' ),
                ) );

            else :
                ?>
                <div class="no-wiki-results">
                    <div class="no-results-icon">📭</div>
                    <h2><?php esc_html_e( 'Nenhum artigo encontrado', 'prof-amr-news' ); ?></h2>
                    <p><?php esc_html_e( 'Tente ajustar os filtros ou fazer uma nova busca.', 'prof-amr-news' ); ?></p>
                    <a href="<?php echo esc_url( get_post_type_archive_link( 'yada_wiki' ) ); ?>" class="btn-reset-filters">
                        <?php esc_html_e( 'Limpar Filtros', 'prof-amr-news' ); ?>
                    </a>
                </div>
                <?php
            endif;
            ?>
        </main>
    </div>
</div>

<?php
get_footer();
