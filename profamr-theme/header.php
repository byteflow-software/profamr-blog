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

    <!-- Top Bar with Date/Time -->
    <div class="top-bar">
        <div class="top-bar-inner">
            <div class="top-bar-date">
                <span id="current-date-time"></span>
            </div>
            <div class="top-bar-social">
                <?php
                $github    = get_theme_mod( 'profamr_github', '#' );
                $twitter   = get_theme_mod( 'profamr_twitter', '#' );
                $linkedin  = get_theme_mod( 'profamr_linkedin', '#' );
                $instagram = get_theme_mod( 'profamr_instagram', '#' );
                ?>
                <a href="<?php echo esc_url( $github ); ?>" target="_blank" aria-label="GitHub">📖</a>
                <a href="<?php echo esc_url( $twitter ); ?>" target="_blank" aria-label="Twitter">𝕏</a>
                <a href="<?php echo esc_url( $linkedin ); ?>" target="_blank" aria-label="LinkedIn">in</a>
                <a href="<?php echo esc_url( $instagram ); ?>" target="_blank" aria-label="Instagram">📷</a>
            </div>
        </div>
    </div>

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

            </nav>
        </div>
    </header>

    <!-- News Ticker -->
    <?php
    $recent_posts = new WP_Query( array(
        'posts_per_page' => 5,
        'post_status'    => 'publish',
    ) );

    if ( $recent_posts->have_posts() ) :
        ?>
        <div class="news-ticker-wrapper">
            <div class="news-ticker-label">
                📰 NEWS
            </div>
            <div class="news-ticker-content">
                <div class="news-ticker-items">
                    <?php
                    // Duplicate for infinite scroll
                    for ( $i = 0; $i < 2; $i++ ) :
                        $recent_posts->rewind_posts();
                        while ( $recent_posts->have_posts() ) :
                            $recent_posts->the_post();
                            ?>
                            <div class="news-ticker-item">
                                <span class="news-ticker-date"><?php echo esc_html( human_time_diff( get_the_time( 'U' ), current_time( 'timestamp' ) ) ) . ' ' . __( 'Ago', 'profamr' ); ?></span>
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </div>
                            <?php
                        endwhile;
                    endfor;
                    wp_reset_postdata();
                    ?>
                </div>
            </div>
        </div>
        <?php
    endif;
    ?>

    <main id="primary" class="site-content">
