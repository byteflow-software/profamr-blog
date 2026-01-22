<?php
/**
 * The main template file
 *
 * @package ProfAMR
 * @since 2.0.0
 */

get_header();
?>

<div class="container">
    <?php if ( is_home() && ! is_front_page() ) : ?>
        <header class="page-header">
            <h1 class="page-title"><?php single_post_title(); ?></h1>
        </header>
    <?php endif; ?>

    <div class="content-area">
        <div class="main-content">
            <?php
            if ( have_posts() ) :

                // Check if we're displaying wiki posts
                $is_wiki = is_post_type_archive( 'wiki' ) || ( is_tax() && get_queried_object()->taxonomy === 'wiki_category' );

                if ( $is_wiki ) {
                    ?>
                    <header class="archive-header">
                        <h1 class="archive-title">
                            <?php
                            if ( is_post_type_archive( 'wiki' ) ) {
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

        <?php
        // Show sidebar only if active
        if ( is_active_sidebar( 'sidebar-1' ) ) {
            get_sidebar();
        }
        ?>
    </div>
</div>

<?php
get_footer();
