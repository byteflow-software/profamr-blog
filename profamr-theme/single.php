<?php
/**
 * The template for displaying single posts
 *
 * @package ProfAMR
 * @since 2.0.0
 */

get_header();
?>

<div class="container-narrow">
    <?php
    while ( have_posts() ) :
        the_post();
        ?>

        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header class="single-post-header">
                <?php
                // Display category or post type
                $categories = get_the_category();
                if ( ! empty( $categories ) ) {
                    echo '<div class="post-categories">';
                    foreach ( $categories as $category ) {
                        echo '<a href="' . esc_url( get_category_link( $category->term_id ) ) . '" class="post-card-category">' . esc_html( $category->name ) . '</a> ';
                    }
                    echo '</div>';
                }
                ?>

                <h1 class="single-post-title"><?php the_title(); ?></h1>

                <div class="single-post-meta">
                    <?php if ( get_theme_mod( 'profamr_show_author', true ) ) : ?>
                        <span class="post-author">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                            <?php the_author_posts_link(); ?>
                        </span>
                    <?php endif; ?>

                    <?php if ( get_theme_mod( 'profamr_show_date', true ) ) : ?>
                        <span class="post-date">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                            </svg>
                            <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                                <?php echo esc_html( get_the_date() ); ?>
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
                <div class="post-thumbnail">
                    <?php the_post_thumbnail( 'large' ); ?>
                </div>
            <?php endif; ?>

            <div class="entry-content">
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
                // Tags
                $tags_list = get_the_tag_list( '', esc_html_x( ', ', 'list item separator', 'profamr' ) );
                if ( $tags_list ) {
                    /* translators: %s: list of tags */
                    printf( '<div class="tags-links"><strong>' . esc_html__( 'Tags:', 'profamr' ) . '</strong> %s</div>', $tags_list ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                }
                ?>
            </footer>
        </article>

        <?php
        // Post navigation
        the_post_navigation(
            array(
                'prev_text' => '<span class="nav-subtitle">' . esc_html__( 'Previous:', 'profamr' ) . '</span> <span class="nav-title">%title</span>',
                'next_text' => '<span class="nav-subtitle">' . esc_html__( 'Next:', 'profamr' ) . '</span> <span class="nav-title">%title</span>',
            )
        );

        // If comments are open or we have at least one comment, load up the comment template
        if ( comments_open() || get_comments_number() ) :
            comments_template();
        endif;

    endwhile;
    ?>
</div>

<?php
get_footer();
