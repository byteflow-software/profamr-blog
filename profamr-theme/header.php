<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site-container">
    <a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'profamr' ); ?></a>

    <header id="masthead" class="site-header">
        <div class="header-inner">
            <div class="site-branding">
                <?php
                if ( has_custom_logo() ) {
                    the_custom_logo();
                } else {
                    ?>
                    <div class="site-identity">
                        <?php if ( is_front_page() && is_home() ) : ?>
                            <h1 class="site-title">
                                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
                                    <?php bloginfo( 'name' ); ?>
                                </a>
                            </h1>
                        <?php else : ?>
                            <p class="site-title">
                                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
                                    <?php bloginfo( 'name' ); ?>
                                </a>
                            </p>
                        <?php endif; ?>

                        <?php
                        $profamr_description = get_bloginfo( 'description', 'display' );
                        if ( $profamr_description || is_customize_preview() ) :
                            ?>
                            <p class="site-description"><?php echo $profamr_description; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
                        <?php endif; ?>
                    </div>
                    <?php
                }
                ?>
            </div>

            <nav id="site-navigation" class="main-navigation">
                <button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false">
                    <span class="screen-reader-text"><?php esc_html_e( 'Menu', 'profamr' ); ?></span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </button>

                <?php
                wp_nav_menu(
                    array(
                        'theme_location' => 'primary',
                        'menu_id'        => 'primary-menu',
                        'container'      => false,
                        'fallback_cb'    => 'profamr_fallback_menu',
                    )
                );
                ?>

                <div class="header-search">
                    <?php get_search_form(); ?>
                </div>
            </nav>
        </div>
    </header>

    <main id="primary" class="site-content">
