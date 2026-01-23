<?php
/**
 * The main template file
 *
 * @package ProfAMR
 * @since 2.0.0
 */

get_header();
?>

<?php if ( is_home() || is_archive() ) : ?>
    <!-- Layout with Sidebar -->
    <div class="layout-with-sidebar">
        <?php get_template_part( 'sidebar', 'process-guide' ); ?>

        <div class="main-content-wrapper">
        <div class="main-content">
            <?php
            if ( have_posts() ) :

                // Check if we're displaying wiki posts
                $is_wiki = is_post_type_archive( 'yada_wiki' ) || ( is_tax() && get_queried_object()->taxonomy === 'wiki_category' );

                if ( $is_wiki ) {
                    ?>
                    <header class="archive-header">
                        <h1 class="archive-title">
                            <?php
                            if ( is_post_type_archive( 'yada_wiki' ) ) {
                                echo esc_html__( 'Wiki', 'profamr' );
                            } else {
                                single_term_title();
                            }
                            ?>
                        </h1>
                        <?php
                        if ( is_tax() && term_description() ) {
                            echo '<div class="archive-description">' . wp_kses_post( term_description() ) . '</div>';
                        }
                        ?>
                    </header>
                    <?php
                }

                echo '<div class="posts-grid">';

                // Start the Loop
                while ( have_posts() ) :
                    the_post();

                    // Include the post card template
                    get_template_part( 'template-parts/content', get_post_type() );

                endwhile;

                echo '</div>';

                // Pagination
                profamr_pagination();

            else :

                get_template_part( 'template-parts/content', 'none' );

            endif;
            ?>
        </div>

        </div>
    </div>
<?php else : ?>
    <!-- Regular Layout for Single Posts -->
    <div class="container">
        <div class="content-area">
            <div class="main-content">
                <?php
                if ( have_posts() ) :
                    while ( have_posts() ) :
                        the_post();
                        get_template_part( 'template-parts/content', get_post_type() );
                    endwhile;
                else :
                    get_template_part( 'template-parts/content', 'none' );
                endif;
                ?>
            </div>

            <?php
            // Show sidebar only if active
            if ( is_active_sidebar( 'sidebar-1' ) ) {
                get_sidebar();
            }
            ?>
        </div>
    </div>
<?php endif; ?>

<?php
get_footer();
