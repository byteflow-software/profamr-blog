<?php
/**
 * The template for displaying search results
 *
 * @package ProfAMR
 * @since 2.0.0
 */

get_header();
?>

<div class="container">
    <header class="page-header">
        <h1 class="page-title">
            <?php
            /* translators: %s: search query */
            printf( esc_html__( 'Search Results for: %s', 'profamr' ), '<span>' . get_search_query() . '</span>' );
            ?>
        </h1>
    </header>

    <div class="content-area">
        <div class="main-content">
            <?php if ( have_posts() ) : ?>
                <div class="posts-grid">
                    <?php
                    while ( have_posts() ) :
                        the_post();
                        get_template_part( 'template-parts/content', get_post_type() );
                    endwhile;
                    ?>
                </div>

                <?php profamr_pagination(); ?>

            <?php else : ?>
                <?php get_template_part( 'template-parts/content', 'none' ); ?>
            <?php endif; ?>
        </div>

        <?php
        if ( is_active_sidebar( 'sidebar-1' ) ) {
            get_sidebar();
        }
        ?>
    </div>
</div>

<?php
get_footer();
