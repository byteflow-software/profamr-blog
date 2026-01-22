<?php
/**
 * Template part for displaying wiki posts
 *
 * @package ProfAMR
 * @since 2.0.0
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'post-card wiki-card' ); ?>>
    <?php if ( has_post_thumbnail() ) : ?>
        <a href="<?php the_permalink(); ?>" class="post-card-link">
            <?php the_post_thumbnail( 'profamr-featured', array( 'class' => 'post-card-thumbnail' ) ); ?>
        </a>
    <?php endif; ?>

    <div class="post-card-content">
        <span class="post-card-category wiki-badge"><?php esc_html_e( 'Wiki', 'profamr' ); ?></span>

        <h2 class="post-card-title">
            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
        </h2>

        <div class="post-card-meta">
            <?php
            $wiki_categories = get_the_terms( get_the_ID(), 'wiki_category' );
            if ( $wiki_categories && ! is_wp_error( $wiki_categories ) ) {
                $category_names = array();
                foreach ( $wiki_categories as $category ) {
                    $category_names[] = $category->name;
                }
                echo '<span class="wiki-categories-list">' . esc_html( implode( ', ', $category_names ) ) . '</span>';
            }
            ?>

            <span class="post-date">
                <time datetime="<?php echo esc_attr( get_the_modified_date( 'c' ) ); ?>">
                    <?php
                    /* translators: %s: post date */
                    printf( esc_html__( 'Updated: %s', 'profamr' ), esc_html( get_the_modified_date() ) );
                    ?>
                </time>
            </span>

            <?php if ( get_theme_mod( 'profamr_show_reading_time', true ) ) : ?>
                <span class="reading-time">
                    <?php profamr_display_reading_time(); ?>
                </span>
            <?php endif; ?>
        </div>

        <div class="post-card-excerpt">
            <?php the_excerpt(); ?>
        </div>

        <a href="<?php the_permalink(); ?>" class="read-more">
            <?php esc_html_e( 'Read Wiki Article', 'profamr' ); ?> &rarr;
        </a>
    </div>
</article>
