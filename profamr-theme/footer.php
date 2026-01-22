    </main><!-- #primary -->

    <footer id="colophon" class="site-footer">
        <div class="footer-inner">
            <?php if ( is_active_sidebar( 'footer-1' ) || is_active_sidebar( 'footer-2' ) || is_active_sidebar( 'footer-3' ) ) : ?>
                <div class="footer-widgets">
                    <div class="container">
                        <div class="footer-widgets-grid">
                            <?php if ( is_active_sidebar( 'footer-1' ) ) : ?>
                                <div class="footer-widget-area">
                                    <?php dynamic_sidebar( 'footer-1' ); ?>
                                </div>
                            <?php endif; ?>

                            <?php if ( is_active_sidebar( 'footer-2' ) ) : ?>
                                <div class="footer-widget-area">
                                    <?php dynamic_sidebar( 'footer-2' ); ?>
                                </div>
                            <?php endif; ?>

                            <?php if ( is_active_sidebar( 'footer-3' ) ) : ?>
                                <div class="footer-widget-area">
                                    <?php dynamic_sidebar( 'footer-3' ); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <div class="footer-bottom">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-text">
                            <?php
                            $footer_text = get_theme_mod( 'profamr_footer_text', sprintf(
                                /* translators: %s: current year */
                                __( '© %s Prof AMR. All rights reserved.', 'profamr' ),
                                gmdate( 'Y' )
                            ) );
                            echo wp_kses_post( $footer_text );
                            ?>
                        </div>

                        <?php if ( has_nav_menu( 'footer' ) ) : ?>
                            <nav class="footer-navigation" aria-label="<?php esc_attr_e( 'Footer Menu', 'profamr' ); ?>">
                                <?php
                                wp_nav_menu(
                                    array(
                                        'theme_location' => 'footer',
                                        'menu_class'     => 'footer-menu',
                                        'depth'          => 1,
                                        'container'      => false,
                                    )
                                );
                                ?>
                            </nav>
                        <?php endif; ?>

                        <?php
                        // Social media links
                        $twitter  = get_theme_mod( 'profamr_twitter', '' );
                        $linkedin = get_theme_mod( 'profamr_linkedin', '' );
                        $github   = get_theme_mod( 'profamr_github', '' );
                        $email    = get_theme_mod( 'profamr_email', '' );

                        if ( $twitter || $linkedin || $github || $email ) :
                            ?>
                            <div class="footer-social">
                                <?php if ( $twitter ) : ?>
                                    <a href="<?php echo esc_url( $twitter ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Twitter', 'profamr' ); ?>">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                                        </svg>
                                    </a>
                                <?php endif; ?>

                                <?php if ( $linkedin ) : ?>
                                    <a href="<?php echo esc_url( $linkedin ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'LinkedIn', 'profamr' ); ?>">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                                            <circle cx="4" cy="4" r="2"/>
                                        </svg>
                                    </a>
                                <?php endif; ?>

                                <?php if ( $github ) : ?>
                                    <a href="<?php echo esc_url( $github ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'GitHub', 'profamr' ); ?>">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                                        </svg>
                                    </a>
                                <?php endif; ?>

                                <?php if ( $email ) : ?>
                                    <a href="mailto:<?php echo esc_attr( antispambot( $email ) ); ?>" aria-label="<?php esc_attr_e( 'Email', 'profamr' ); ?>">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    </a>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
