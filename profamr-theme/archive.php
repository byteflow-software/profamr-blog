<?php
/**
 * The template for displaying archive pages
 *
 * @package ProfAMR
 * @since 2.0.0
 */

get_header();
?>

<div class="container">
    <?php if ( have_posts() ) : ?>
        <header class="archive-header">
            <?php
            the_archive_title( '<h1 class="archive-title">', '</h1>' );
            the_archive_description( '<div class="archive-description">', '</div>' );
            ?>
        </header>

        <div class="content-area">
            <div class="main-content">
                <div class="posts-grid">
                    <?php
                    while ( have_posts() ) :
                        the_post();
                        get_template_part( 'template-parts/content', get_post_type() );
                    endwhile;
                    ?>
                </div>

                <?php profamr_pagination(); ?>
            </div>

            <?php
            if ( is_active_sidebar( 'sidebar-1' ) ) {
                get_sidebar();
            }
            ?>
        </div>

    <?php else : ?>
        <?php get_template_part( 'template-parts/content', 'none' ); ?>
    <?php endif; ?>
</div>

<?php
get_footer();
