<?php
/**
 * The template for displaying single wiki articles
 *
 * @package ProfAMR
 * @since 2.0.0
 */

get_header();
?>

<div class="container">
    <div class="content-area">
        <div class="main-content">
            <?php
            while ( have_posts() ) :
                the_post();
                ?>

                <article id="post-<?php the_ID(); ?>" <?php post_class( 'wiki-article' ); ?>>
                    <header class="single-post-header wiki-header">
                        <div class="wiki-badge"><?php esc_html_e( 'Wiki', 'profamr' ); ?></div>

                        <?php
                        // Display wiki categories
                        $wiki_categories = get_the_terms( get_the_ID(), 'wiki_category' );
                        if ( $wiki_categories && ! is_wp_error( $wiki_categories ) ) {
                            echo '<div class="wiki-categories">';
                            foreach ( $wiki_categories as $category ) {
                                echo '<a href="' . esc_url( get_term_link( $category ) ) . '" class="wiki-category-link">' . esc_html( $category->name ) . '</a> ';
                            }
                            echo '</div>';
                        }
                        ?>

                        <h1 class="single-post-title"><?php the_title(); ?></h1>

                        <div class="single-post-meta">
                            <?php if ( get_theme_mod( 'profamr_show_date', true ) ) : ?>
                                <span class="post-date">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                                    </svg>
                                    <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                                        <?php
                                        /* translators: %s: post date */
                                        printf( esc_html__( 'Updated: %s', 'profamr' ), esc_html( get_the_modified_date() ) );
                                        ?>
                                    </time>
                                </span>
                            <?php endif; ?>

                            <?php if ( get_theme_mod( 'profamr_show_reading_time', true ) ) : ?>
                                <span class="post-reading-time">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                                    </svg>
                                    <?php profamr_display_reading_time(); ?>
                                </span>
                            <?php endif; ?>
                        </div>
                    </header>

                    <?php if ( has_post_thumbnail() ) : ?>
                        <div class="post-thumbnail wiki-thumbnail">
                            <?php the_post_thumbnail( 'large' ); ?>
                        </div>
                    <?php endif; ?>

                    <div class="entry-content wiki-content">
                        <?php
                        the_content();

                        wp_link_pages(
                            array(
                                'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'profamr' ),
                                'after'  => '</div>',
                            )
                        );
                        ?>
                    </div>

                    <footer class="entry-footer">
                        <?php
                        // Wiki tags
                        $wiki_tags = get_the_terms( get_the_ID(), 'wiki_tag' );
                        if ( $wiki_tags && ! is_wp_error( $wiki_tags ) ) {
                            echo '<div class="wiki-tags"><strong>' . esc_html__( 'Tags:', 'profamr' ) . '</strong> ';
                            $tags = array();
                            foreach ( $wiki_tags as $tag ) {
                                $tags[] = '<a href="' . esc_url( get_term_link( $tag ) ) . '">' . esc_html( $tag->name ) . '</a>';
                            }
                            echo implode( ', ', $tags ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                            echo '</div>';
                        }
                        ?>
                    </footer>
                </article>

                <?php
                // Wiki navigation
                the_post_navigation(
                    array(
                        'prev_text' => '<span class="nav-subtitle">' . esc_html__( 'Previous Wiki:', 'profamr' ) . '</span> <span class="nav-title">%title</span>',
                        'next_text' => '<span class="nav-subtitle">' . esc_html__( 'Next Wiki:', 'profamr' ) . '</span> <span class="nav-title">%title</span>',
                    )
                );

                // Related wiki articles
                $related_args = array(
                    'post_type'      => 'wiki',
                    'posts_per_page' => 3,
                    'post__not_in'   => array( get_the_ID() ),
                    'orderby'        => 'rand',
                );

                // Get articles from same category
                if ( $wiki_categories ) {
                    $category_ids = wp_list_pluck( $wiki_categories, 'term_id' );
                    $related_args['tax_query'] = array(
                        array(
                            'taxonomy' => 'wiki_category',
                            'field'    => 'term_id',
                            'terms'    => $category_ids,
                        ),
                    );
                }

                $related_query = new WP_Query( $related_args );

                if ( $related_query->have_posts() ) :
                    ?>
                    <section class="related-wiki">
                        <h2><?php esc_html_e( 'Related Wiki Articles', 'profamr' ); ?></h2>
                        <div class="posts-grid">
                            <?php
                            while ( $related_query->have_posts() ) :
                                $related_query->the_post();
                                get_template_part( 'template-parts/content', 'wiki' );
                            endwhile;
                            wp_reset_postdata();
                            ?>
                        </div>
                    </section>
                    <?php
                endif;

                // If comments are open or we have at least one comment, load up the comment template
                if ( comments_open() || get_comments_number() ) :
                    comments_template();
                endif;

            endwhile;
            ?>
        </div>

        <?php
        // Show wiki sidebar if active
        if ( is_active_sidebar( 'sidebar-wiki' ) ) {
            ?>
            <aside id="secondary" class="sidebar">
                <?php dynamic_sidebar( 'sidebar-wiki' ); ?>
            </aside>
            <?php
        } elseif ( is_active_sidebar( 'sidebar-1' ) ) {
            get_sidebar();
        }
        ?>
    </div>
</div>

<?php
get_footer();
