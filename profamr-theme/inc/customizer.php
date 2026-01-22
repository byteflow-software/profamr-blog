<?php
/**
 * Theme Customizer
 *
 * @package ProfAMR
 * @since 2.0.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register customizer settings
 */
function profamr_customize_register( $wp_customize ) {

    // Add custom section for theme options
    $wp_customize->add_section( 'profamr_theme_options', array(
        'title'    => __( 'Prof AMR Options', 'profamr' ),
        'priority' => 30,
    ) );

    // Primary Color
    $wp_customize->add_setting( 'profamr_primary_color', array(
        'default'           => '#2563eb',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );

    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'profamr_primary_color', array(
        'label'    => __( 'Primary Color', 'profamr' ),
        'section'  => 'profamr_theme_options',
        'settings' => 'profamr_primary_color',
    ) ) );

    // Secondary Color
    $wp_customize->add_setting( 'profamr_secondary_color', array(
        'default'           => '#059669',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );

    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'profamr_secondary_color', array(
        'label'    => __( 'Secondary Color', 'profamr' ),
        'section'  => 'profamr_theme_options',
        'settings' => 'profamr_secondary_color',
    ) ) );

    // Show/Hide Reading Time
    $wp_customize->add_setting( 'profamr_show_reading_time', array(
        'default'           => true,
        'sanitize_callback' => 'profamr_sanitize_checkbox',
    ) );

    $wp_customize->add_control( 'profamr_show_reading_time', array(
        'label'    => __( 'Show Reading Time', 'profamr' ),
        'section'  => 'profamr_theme_options',
        'type'     => 'checkbox',
    ) );

    // Show/Hide Author
    $wp_customize->add_setting( 'profamr_show_author', array(
        'default'           => true,
        'sanitize_callback' => 'profamr_sanitize_checkbox',
    ) );

    $wp_customize->add_control( 'profamr_show_author', array(
        'label'    => __( 'Show Author', 'profamr' ),
        'section'  => 'profamr_theme_options',
        'type'     => 'checkbox',
    ) );

    // Show/Hide Post Date
    $wp_customize->add_setting( 'profamr_show_date', array(
        'default'           => true,
        'sanitize_callback' => 'profamr_sanitize_checkbox',
    ) );

    $wp_customize->add_control( 'profamr_show_date', array(
        'label'    => __( 'Show Post Date', 'profamr' ),
        'section'  => 'profamr_theme_options',
        'type'     => 'checkbox',
    ) );

    // Footer Text
    $wp_customize->add_setting( 'profamr_footer_text', array(
        'default'           => sprintf(
            /* translators: %s: current year */
            __( '© %s Prof AMR. All rights reserved.', 'profamr' ),
            gmdate( 'Y' )
        ),
        'sanitize_callback' => 'wp_kses_post',
    ) );

    $wp_customize->add_control( 'profamr_footer_text', array(
        'label'    => __( 'Footer Text', 'profamr' ),
        'section'  => 'profamr_theme_options',
        'type'     => 'textarea',
    ) );

    // Social Media Links Section
    $wp_customize->add_section( 'profamr_social_media', array(
        'title'    => __( 'Social Media Links', 'profamr' ),
        'priority' => 31,
    ) );

    // Twitter
    $wp_customize->add_setting( 'profamr_twitter', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
    ) );

    $wp_customize->add_control( 'profamr_twitter', array(
        'label'    => __( 'Twitter URL', 'profamr' ),
        'section'  => 'profamr_social_media',
        'type'     => 'url',
    ) );

    // LinkedIn
    $wp_customize->add_setting( 'profamr_linkedin', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
    ) );

    $wp_customize->add_control( 'profamr_linkedin', array(
        'label'    => __( 'LinkedIn URL', 'profamr' ),
        'section'  => 'profamr_social_media',
        'type'     => 'url',
    ) );

    // GitHub
    $wp_customize->add_setting( 'profamr_github', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
    ) );

    $wp_customize->add_control( 'profamr_github', array(
        'label'    => __( 'GitHub URL', 'profamr' ),
        'section'  => 'profamr_social_media',
        'type'     => 'url',
    ) );

    // Email
    $wp_customize->add_setting( 'profamr_email', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_email',
    ) );

    $wp_customize->add_control( 'profamr_email', array(
        'label'    => __( 'Email Address', 'profamr' ),
        'section'  => 'profamr_social_media',
        'type'     => 'email',
    ) );
}
add_action( 'customize_register', 'profamr_customize_register' );

/**
 * Sanitize checkbox
 */
function profamr_sanitize_checkbox( $checked ) {
    return ( ( isset( $checked ) && true === $checked ) ? true : false );
}

/**
 * Output custom CSS
 */
function profamr_customizer_css() {
    $primary_color = get_theme_mod( 'profamr_primary_color', '#2563eb' );
    $secondary_color = get_theme_mod( 'profamr_secondary_color', '#059669' );

    ?>
    <style type="text/css">
        :root {
            --color-primary: <?php echo esc_attr( $primary_color ); ?>;
            --color-secondary: <?php echo esc_attr( $secondary_color ); ?>;
        }
    </style>
    <?php
}
add_action( 'wp_head', 'profamr_customizer_css' );
