<?php
/*
Template Name: Yada Wiki Single
Template Post Type: wiki
*/
get_header();
?>

<div id="primary" class="content-area wiki-content">
    <!-- .entry-header -->
    <main id="main" class="site-main">
         <div class="main-content1">
            <?php
                get_sidebar();
            ?>
        </div>
        <div class="main-content2">
            <!-- <header class="entry-header" style="width: 100%;">
                <?php the_title( ); ?>
            </header> -->
             <header class="page-header" style="width: 100%;">
                <h2 class="widget-title">
                    <?php
                    // Título da página de arquivo para o Yada Wiki
                    echo the_title( ); // Você pode personalizar este título
                    ?>
                </h2>
            </header>
        <?php
        while ( have_posts() ) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?> style="padding: 0 1rem 1rem 1rem; ">

                <div class="entry-content" style="margin: 0;">
                    <?php
                    the_content(
                        sprintf(
                            wp_kses(
                                /* translators: %s: Name of current post. Only visible to screen readers */
                                __( 'Continue reading<span class="screen-reader-text"> "%s"</span>', 'your-text-domain' ),
                                array(
                                    'span' => array(
                                        'class' => array(),
                                    ),
                                )
                            ),
                            wp_kses_post( get_the_title() )
                        )
                    );

                    wp_link_pages(
                        array(
                            'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'your-text-domain' ),
                            'after'  => '</div>',
                        )
                    );
                    ?>
                </div><!-- .entry-content -->

                <footer class="entry-footer">
                    <?php edit_post_link( esc_html__( 'Edit', 'your-text-domain' ), '<span class="edit-link">', '</span>' ); ?>
                </footer><!-- .entry-footer -->
            </article><!-- #post-<?php the_ID(); ?> -->
            <?php

            // If comments are open or we have at least one comment, load up the comment template.
            if ( comments_open() || get_comments_number() ) :
                comments_template();
            endif;

        endwhile; // End of the loop.
        ?>
        </div>
    </main><!-- #main -->
</div><!-- #primary -->

<?php
get_sidebar('wiki');
get_footer();
?>
