<?php
/**
 * The template for displaying pages
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
            <header class="page-header">
                <h1 class="page-title"><?php the_title(); ?></h1>
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
        </article>

        <?php
        // If comments are open or we have at least one comment, load up the comment template
        if ( comments_open() || get_comments_number() ) :
            comments_template();
        endif;

    endwhile;
    ?>
</div>

<?php
get_footer();
