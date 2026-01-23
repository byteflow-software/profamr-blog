<?php
/**
 * Prof AMR Custom Functions
 * 
 * Funções personalizadas para o tema Prof AMR
 */

// Adicionar suporte para logo personalizado do Prof AMR (desativado)
/*
function prof_amr_custom_logo_setup() {
    add_theme_support("custom-logo", array(
        "height"      => 120,
        "width"       => 300,
        "flex-width"  => true,
        "flex-height" => true,
        "header-text" => array("site-title", "site-description"),
    ));
}
add_action("after_setup_theme", "prof_amr_custom_logo_setup");
*/

// Personalizar o título do site para Prof AMR
function prof_amr_customize_site_title($title) {
    if (is_home() || is_front_page()) {
        return 'Prof AMR - Portal de Notícias';
    }
    return $title . ' | Prof AMR';
}
add_filter('wp_title', 'prof_amr_customize_site_title');


function prof_amr_theme_widgets_init() {
    register_sidebar( array(
        'name'          => esc_html__( 'Sidebar Wiki', 'prof-amr-theme' ),
        'id'            => 'sidebar-yada_wiki',
        'description'   => esc_html__( 'Adicione widgets aqui para aparecer na sidebar das páginas Wiki.', 'prof-amr-theme' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ) );
}
add_action( 'widgets_init', 'newsmatic_widgets_init' );

// Adicionar meta tags personalizadas para Prof AMR
function prof_amr_custom_meta_tags() {
    echo '<meta name="author" content="Prof AMR Team">' . "\n";
    echo '<meta name="description" content="Portal de notícias Prof AMR - Informação de qualidade e atualizada">' . "\n";
    echo '<meta property="og:site_name" content="Prof AMR">' . "\n";
}
add_action('wp_head', 'prof_amr_custom_meta_tags');

// Personalizar o rodapé com informações do Prof AMR
function prof_amr_custom_footer_text() {
    return '© ' . date('Y') . ' Prof AMR. Todos os direitos reservados. Portal de notícias e informação.';
}

// Adicionar estilos personalizados para categorias do Prof AMR (desativado)
/*
function prof_amr_category_colors() {
    $categories = array(
        'politica' => '#dc2626',
        'economia' => '#059669',
        'esportes' => '#7c3aed',
        'tecnologia' => '#2563eb',
        'cultura' => '#ea580c',
        'saude' => '#16a34a'
    );
    
    echo '<style>';
    foreach ($categories as $category => $color) {
        echo ".category-{$category} { background-color: {$color}; color: white; }";
    }
    echo '</style>';
}
add_action('wp_head', 'prof_amr_category_colors');
*/

// Widget personalizado para notícias em destaque do Prof AMR
class Prof_AMR_Featured_News_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'prof_amr_featured_news',
            'Prof AMR - Notícias em Destaque',
            array('description' => 'Exibe notícias em destaque do Prof AMR')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $query = new WP_Query(array(
            'posts_per_page' => 5,
            'meta_key' => 'featured_post',
            'meta_value' => 'yes'
        ));
        
        if ($query->have_posts()) {
            echo '<ul class="prof-amr-featured-list">';
            while ($query->have_posts()) {
                $query->the_post();
                echo '<li><a href="' . get_permalink() . '">' . get_the_title() . '</a></li>';
            }
            echo '</ul>';
            wp_reset_postdata();
        }
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Notícias em Destaque';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">Título:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        return $instance;
    }
}

// Registrar o widget
function prof_amr_register_widgets() {
    register_widget('Prof_AMR_Featured_News_Widget');
}
add_action('widgets_init', 'prof_amr_register_widgets');

// Adicionar campo personalizado para posts em destaque
function prof_amr_add_featured_meta_box() {
    add_meta_box(
        'prof_amr_featured',
        'Prof AMR - Post em Destaque',
        'prof_amr_featured_meta_box_callback',
        'post'
    );
}
add_action('add_meta_boxes', 'prof_amr_add_featured_meta_box');

function prof_amr_featured_meta_box_callback($post) {
    wp_nonce_field('prof_amr_featured_nonce', 'prof_amr_featured_nonce');
    $value = get_post_meta($post->ID, 'featured_post', true);
    echo '<label for="prof_amr_featured_field">Marcar como notícia em destaque: </label>';
    echo '<input type="checkbox" id="prof_amr_featured_field" name="prof_amr_featured_field" value="yes"' . checked($value, 'yes', false) . '>';
}

function prof_amr_save_featured_meta_box($post_id) {
    if (!isset($_POST['prof_amr_featured_nonce'])) return;
    if (!wp_verify_nonce($_POST['prof_amr_featured_nonce'], 'prof_amr_featured_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    
    if (isset($_POST['prof_amr_featured_field'])) {
        update_post_meta($post_id, 'featured_post', 'yes');
    } else {
        delete_post_meta($post_id, 'featured_post');
    }
}
add_action('save_post', 'prof_amr_save_featured_meta_box');

/**
 * Enqueue Wiki Modern Styles and Scripts
 *
 * @since 2.0.0
 */
function prof_amr_enqueue_wiki_assets() {
    // Only load on wiki archive pages
    if ( is_post_type_archive( 'yada_wiki' ) || is_tax( 'wiki_category' ) || is_tax( 'wiki_tag' ) ) {
        // Wiki Modern CSS
        wp_enqueue_style(
            'prof-amr-wiki-modern',
            get_template_directory_uri() . '/assets/css/wiki-modern.css',
            array(),
            '2.0.0'
        );

        // Wiki Filters JS
        wp_enqueue_script(
            'prof-amr-wiki-filters',
            get_template_directory_uri() . '/assets/js/wiki-filters.js',
            array(),
            '2.0.0',
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'prof_amr_enqueue_wiki_assets' );

/**
 * Handle Wiki Sorting
 *
 * @since 2.0.0
 */
function prof_amr_wiki_sorting( $query ) {
    if ( ! is_admin() && $query->is_main_query() && is_post_type_archive( 'yada_wiki' ) ) {
        if ( isset( $_GET['orderby'] ) && isset( $_GET['order'] ) ) {
            $orderby = sanitize_text_field( $_GET['orderby'] );
            $order = sanitize_text_field( $_GET['order'] );

            $query->set( 'orderby', $orderby );
            $query->set( 'order', strtoupper( $order ) );
        }
    }
}
add_action( 'pre_get_posts', 'prof_amr_wiki_sorting' );
?>