<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @package ProfAMR
 * @since 2.0.0
 */

get_header();
?>

<div class="container-narrow">
    <section class="error-404 not-found">
        <header class="page-header">
            <h1 class="page-title"><?php esc_html_e( '404 - Page Not Found', 'profamr' ); ?></h1>
        </header>

        <div class="page-content">
            <p><?php esc_html_e( 'It looks like nothing was found at this location. Maybe try searching?', 'profamr' ); ?></p>

            <?php get_search_form(); ?>

            <div class="widget widget_categories">
                <h2 class="widget-title"><?php esc_html_e( 'Most Used Categories', 'profamr' ); ?></h2>
                <ul>
                    <?php
                    wp_list_categories(
                        array(
                            'orderby'    => 'count',
                            'order'      => 'DESC',
                            'show_count' => 1,
                            'title_li'   => '',
                            'number'     => 10,
                        )
                    );
                    ?>
                </ul>
            </div>

            <?php
            // Check if wiki articles exist
            $wiki_query = new WP_Query( array(
                'post_type'      => 'wiki',
                'posts_per_page' => 5,
                'orderby'        => 'rand',
            ) );

            if ( $wiki_query->have_posts() ) :
                ?>
                <div class="widget">
                    <h2 class="widget-title"><?php esc_html_e( 'Browse Wiki Articles', 'profamr' ); ?></h2>
                    <ul>
                        <?php
                        while ( $wiki_query->have_posts() ) :
                            $wiki_query->the_post();
                            ?>
                            <li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
                        <?php endwhile; ?>
                    </ul>
                </div>
                <?php
                wp_reset_postdata();
            endif;
            ?>
        </div>
    </section>
</div>

<?php
get_footer();
