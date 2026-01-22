<?php
/**
 * The template for displaying comments
 *
 * @package ProfAMR
 * @since 2.0.0
 */

if ( post_password_required() ) {
    return;
}
?>

<div id="comments" class="comments-area">
    <?php if ( have_comments() ) : ?>
        <h2 class="comments-title">
            <?php
            $profamr_comment_count = get_comments_number();
            if ( '1' === $profamr_comment_count ) {
                printf(
                    /* translators: %s: post title */
                    esc_html__( 'One comment on &ldquo;%s&rdquo;', 'profamr' ),
                    '<span>' . esc_html( get_the_title() ) . '</span>'
                );
            } else {
                printf(
                    /* translators: 1: number of comments, 2: post title */
                    esc_html( _n( '%1$s comment on &ldquo;%2$s&rdquo;', '%1$s comments on &ldquo;%2$s&rdquo;', $profamr_comment_count, 'profamr' ) ),
                    number_format_i18n( $profamr_comment_count ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                    '<span>' . esc_html( get_the_title() ) . '</span>'
                );
            }
            ?>
        </h2>

        <ol class="comment-list">
            <?php
            wp_list_comments(
                array(
                    'style'       => 'ol',
                    'short_ping'  => true,
                    'avatar_size' => 48,
                )
            );
            ?>
        </ol>

        <?php
        the_comments_navigation();

        if ( ! comments_open() ) :
            ?>
            <p class="no-comments"><?php esc_html_e( 'Comments are closed.', 'profamr' ); ?></p>
            <?php
        endif;

    endif;

    comment_form();
    ?>
</div>
