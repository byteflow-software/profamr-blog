<?php
/**
 * Fallback menu function
 */
function profamr_fallback_menu() {
    echo '<ul id="primary-menu" class="menu">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'profamr' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/wiki/' ) ) . '">' . esc_html__( 'Wiki', 'profamr' ) . '</a></li>';
    wp_list_pages( array(
        'title_li' => '',
        'depth'    => 1,
    ) );
    echo '</ul>';
}
