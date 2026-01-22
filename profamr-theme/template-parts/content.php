<?php
/**
 * Template part for displaying posts
 *
 * @package ProfAMR
 * @since 2.0.0
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'post-card' ); ?>>
    <?php if ( has_post_thumbnail() ) : ?>
        <a href="<?php the_permalink(); ?>" class="post-card-link">
            <?php the_post_thumbnail( 'profamr-featured', array( 'class' => 'post-card-thumbnail' ) ); ?>
        </a>
    <?php endif; ?>

    <div class="post-card-content">
        <?php
        $categories = get_the_category();
        if ( ! empty( $categories ) ) {
            echo '<a href="' . esc_url( get_category_link( $categories[0]->term_id ) ) . '" class="post-card-category">' . esc_html( $categories[0]->name ) . '</a>';
        }
        ?>

        <h2 class="post-card-title">
            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
        </h2>

        <div class="post-card-meta">
            <span class="post-date">
                <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                    <?php echo esc_html( get_the_date() ); ?>
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
            <?php esc_html_e( 'Read More', 'profamr' ); ?> &rarr;
        </a>
    </div>
</article>
