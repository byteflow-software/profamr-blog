<?php
/**
 * Prof AMR 2.0 Theme Functions
 *
 * @package ProfAMR
 * @since 2.0.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define theme constants
define( 'PROFAMR_VERSION', '2.0.0' );
define( 'PROFAMR_THEME_DIR', get_template_directory() );
define( 'PROFAMR_THEME_URI', get_template_directory_uri() );

/**
 * Theme Setup
 */
function profamr_theme_setup() {
    // Add default posts and comments RSS feed links to head
    add_theme_support( 'automatic-feed-links' );

    // Let WordPress manage the document title
    add_theme_support( 'title-tag' );

    // Enable support for Post Thumbnails
    add_theme_support( 'post-thumbnails' );
    set_post_thumbnail_size( 1200, 630, true );
    add_image_size( 'profamr-featured', 800, 450, true );
    add_image_size( 'profamr-thumbnail', 400, 300, true );

    // Register navigation menus
    register_nav_menus( array(
        'primary' => __( 'Primary Menu', 'profamr' ),
        'footer'  => __( 'Footer Menu', 'profamr' ),
        'wiki'    => __( 'Wiki Menu', 'profamr' ),
    ) );

    // Switch default core markup to output valid HTML5
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ) );

    // Add theme support for custom logo
    add_theme_support( 'custom-logo', array(
        'height'      => 80,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ) );

    // Add support for custom background
    add_theme_support( 'custom-background', array(
        'default-color' => 'ffffff',
    ) );

    // Add support for editor styles
    add_theme_support( 'editor-styles' );
    add_editor_style( 'assets/css/editor-style.css' );

    // Add support for responsive embeds
    add_theme_support( 'responsive-embeds' );

    // Add support for wide and full alignment
    add_theme_support( 'align-wide' );

    // Load text domain for translations
    load_theme_textdomain( 'profamr', PROFAMR_THEME_DIR . '/languages' );
}
add_action( 'after_setup_theme', 'profamr_theme_setup' );

/**
 * Set the content width
 */
function profamr_content_width() {
    $GLOBALS['content_width'] = apply_filters( 'profamr_content_width', 1200 );
}
add_action( 'after_setup_theme', 'profamr_content_width', 0 );

/**
 * Register widget areas
 */
function profamr_widgets_init() {
    register_sidebar( array(
        'name'          => __( 'Main Sidebar', 'profamr' ),
        'id'            => 'sidebar-1',
        'description'   => __( 'Add widgets here to appear in your sidebar.', 'profamr' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );

    register_sidebar( array(
        'name'          => __( 'Wiki Sidebar', 'profamr' ),
        'id'            => 'sidebar-yada_wiki',
        'description'   => __( 'Add widgets here to appear in wiki pages.', 'profamr' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );

    register_sidebar( array(
        'name'          => __( 'Footer Widget Area 1', 'profamr' ),
        'id'            => 'footer-1',
        'description'   => __( 'Add widgets here to appear in footer.', 'profamr' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );

    register_sidebar( array(
        'name'          => __( 'Footer Widget Area 2', 'profamr' ),
        'id'            => 'footer-2',
        'description'   => __( 'Add widgets here to appear in footer.', 'profamr' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );

    register_sidebar( array(
        'name'          => __( 'Footer Widget Area 3', 'profamr' ),
        'id'            => 'footer-3',
        'description'   => __( 'Add widgets here to appear in footer.', 'profamr' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );
}
add_action( 'widgets_init', 'profamr_widgets_init' );

/**
 * Enqueue scripts and styles
 */
function profamr_scripts() {
    // Main stylesheet
    wp_enqueue_style( 'profamr-style', get_stylesheet_uri(), array(), PROFAMR_VERSION );

    // Main CSS
    wp_enqueue_style( 'profamr-main', PROFAMR_THEME_URI . '/assets/css/main.css', array(), PROFAMR_VERSION );

    // Main JavaScript
    wp_enqueue_script( 'profamr-main', PROFAMR_THEME_URI . '/assets/js/main.js', array(), PROFAMR_VERSION, true );

    // Comments script
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }

    // Localize script
    wp_localize_script( 'profamr-main', 'profamrData', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'profamr-nonce' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'profamr_scripts' );

/**
 * Include custom post types
 */
require_once PROFAMR_THEME_DIR . '/inc/custom-post-types.php';

/**
 * Include taxonomies
 */
require_once PROFAMR_THEME_DIR . '/inc/taxonomies.php';

/**
 * Include custom widgets
 */
require_once PROFAMR_THEME_DIR . '/inc/widgets.php';

/**
 * Include customizer settings
 */
require_once PROFAMR_THEME_DIR . '/inc/customizer.php';

/**
 * Custom excerpt length
 */
function profamr_excerpt_length( $length ) {
    return 30;
}
add_filter( 'excerpt_length', 'profamr_excerpt_length' );

/**
 * Custom excerpt more
 */
function profamr_excerpt_more( $more ) {
    return '...';
}
add_filter( 'excerpt_more', 'profamr_excerpt_more' );

/**
 * Add custom body classes
 */
function profamr_body_classes( $classes ) {
    // Add class if sidebar is active
    if ( is_active_sidebar( 'sidebar-1' ) ) {
        $classes[] = 'has-sidebar';
    }

    // Add class for wiki pages
    if ( is_singular( 'yada_wiki' ) || is_post_type_archive( 'yada_wiki' ) ) {
        $classes[] = 'wiki-page';
    }

    return $classes;
}
add_filter( 'body_class', 'profamr_body_classes' );

/**
 * Add post state for wiki pages in admin
 */
function profamr_display_post_states( $post_states, $post ) {
    if ( 'yada_wiki' === get_post_type( $post ) ) {
        $post_states[] = __( 'Wiki', 'profamr' );
    }
    return $post_states;
}
add_filter( 'display_post_states', 'profamr_display_post_states', 10, 2 );

/**
 * Custom pagination
 */
function profamr_pagination() {
    global $wp_query;

    if ( $wp_query->max_num_pages <= 1 ) {
        return;
    }

    $big = 999999999;

    $links = paginate_links( array(
        'base'      => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
        'format'    => '?paged=%#%',
        'current'   => max( 1, get_query_var( 'paged' ) ),
        'total'     => $wp_query->max_num_pages,
        'prev_text' => '&laquo; ' . __( 'Previous', 'profamr' ),
        'next_text' => __( 'Next', 'profamr' ) . ' &raquo;',
        'type'      => 'list',
    ) );

    if ( $links ) {
        echo '<nav class="pagination" aria-label="' . __( 'Pagination', 'profamr' ) . '">';
        echo $links;
        echo '</nav>';
    }
}

/**
 * Get reading time
 */
function profamr_reading_time( $post_id = null ) {
    if ( ! $post_id ) {
        $post_id = get_the_ID();
    }

    $content = get_post_field( 'post_content', $post_id );
    $word_count = str_word_count( strip_tags( $content ) );
    $reading_time = ceil( $word_count / 200 ); // Average reading speed: 200 words/minute

    return $reading_time;
}

/**
 * Display reading time
 */
function profamr_display_reading_time( $post_id = null ) {
    $time = profamr_reading_time( $post_id );
    /* translators: %d: reading time in minutes */
    echo '<span class="reading-time">' . sprintf( _n( '%d min read', '%d mins read', $time, 'profamr' ), $time ) . '</span>';
}

/**
 * Add custom search form
 */
function profamr_search_form( $form ) {
    $form = '
    <form role="search" method="get" class="search-form" action="' . esc_url( home_url( '/' ) ) . '">
        <label>
            <span class="screen-reader-text">' . _x( 'Search for:', 'label', 'profamr' ) . '</span>
            <input type="search" class="search-field" placeholder="' . esc_attr_x( 'Search...', 'placeholder', 'profamr' ) . '" value="' . get_search_query() . '" name="s" />
        </label>
        <button type="submit" class="search-submit">
            <span class="screen-reader-text">' . esc_html_x( 'Search', 'submit button', 'profamr' ) . '</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
        </button>
    </form>';

    return $form;
}
add_filter( 'get_search_form', 'profamr_search_form' );

/**
 * Add schema.org markup
 */
function profamr_schema_markup() {
    if ( is_singular() ) {
        $schema = array(
            '@context' => 'https://schema.org',
            '@type'    => 'Article',
            'headline' => get_the_title(),
            'author'   => array(
                '@type' => 'Person',
                'name'  => get_the_author(),
            ),
            'datePublished' => get_the_date( 'c' ),
            'dateModified'  => get_the_modified_date( 'c' ),
        );

        if ( has_post_thumbnail() ) {
            $schema['image'] = get_the_post_thumbnail_url( null, 'full' );
        }

        echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES ) . '</script>';
    }
}
add_action( 'wp_head', 'profamr_schema_markup' );

/**
 * Add meta tags for SEO
 */
function profamr_meta_tags() {
    if ( is_singular() ) {
        $description = get_the_excerpt();
        if ( empty( $description ) ) {
            $description = get_bloginfo( 'description' );
        }
        ?>
        <meta name="description" content="<?php echo esc_attr( $description ); ?>">
        <meta property="og:title" content="<?php echo esc_attr( get_the_title() ); ?>">
        <meta property="og:description" content="<?php echo esc_attr( $description ); ?>">
        <meta property="og:type" content="article">
        <meta property="og:url" content="<?php echo esc_url( get_permalink() ); ?>">
        <?php if ( has_post_thumbnail() ) : ?>
        <meta property="og:image" content="<?php echo esc_url( get_the_post_thumbnail_url( null, 'full' ) ); ?>">
        <?php endif; ?>
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="<?php echo esc_attr( get_the_title() ); ?>">
        <meta name="twitter:description" content="<?php echo esc_attr( $description ); ?>">
        <?php if ( has_post_thumbnail() ) : ?>
        <meta name="twitter:image" content="<?php echo esc_url( get_the_post_thumbnail_url( null, 'full' ) ); ?>">
        <?php endif; ?>
        <?php
    }
}
add_action( 'wp_head', 'profamr_meta_tags' );

/**
 * Sanitize SVG uploads
 */
function profamr_check_svg_on_upload( $file ) {
    if ( ! function_exists( 'wp_check_filetype' ) ) {
        return $file;
    }

    $filetype = wp_check_filetype( $file['name'] );

    if ( 'image/svg+xml' === $filetype['type'] ) {
        $file['type'] = 'image/svg+xml';
    }

    return $file;
}
add_filter( 'wp_handle_upload_prefilter', 'profamr_check_svg_on_upload' );

/**
 * Allow SVG uploads
 */
function profamr_mime_types( $mimes ) {
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
}
add_filter( 'upload_mimes', 'profamr_mime_types' );

/**
 * Add custom classes to navigation menu items
 */
function profamr_nav_menu_css_class( $classes, $item, $args ) {
    if ( 'primary' === $args->theme_location ) {
        $classes[] = 'nav-item';
    }
    return $classes;
}
add_filter( 'nav_menu_css_class', 'profamr_nav_menu_css_class', 10, 3 );

/**
 * Add async/defer to scripts
 */
function profamr_add_async_defer_attribute( $tag, $handle ) {
    $async_scripts = array( 'profamr-main' );

    if ( in_array( $handle, $async_scripts, true ) ) {
        return str_replace( ' src', ' defer src', $tag );
    }

    return $tag;
}
add_filter( 'script_loader_tag', 'profamr_add_async_defer_attribute', 10, 2 );

/**
 * Performance optimization: Remove emoji scripts
 */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/**
 * Performance optimization: Remove WordPress version
 */
remove_action( 'wp_head', 'wp_generator' );

/**
 * Flush rewrite rules on theme activation
 */
function profamr_flush_rewrite_rules() {
    // Register custom post types and taxonomies
    profamr_register_wiki_post_type();
    profamr_register_tools_post_type();
    profamr_register_wiki_category_taxonomy();
    profamr_register_wiki_tags_taxonomy();
    profamr_register_tool_type_taxonomy();

    // Flush rewrite rules
    flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'profamr_flush_rewrite_rules' );

/**
 * Fallback menu for primary navigation
 */
function profamr_fallback_menu() {
    echo '<ul>';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'profamr' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/wiki/' ) ) . '">' . esc_html__( 'Wiki', 'profamr' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/tools/' ) ) . '">' . esc_html__( 'Tools', 'profamr' ) . '</a></li>';
    wp_list_pages( array(
        'title_li' => '',
        'depth'    => 1,
    ) );
    echo '</ul>';
}
