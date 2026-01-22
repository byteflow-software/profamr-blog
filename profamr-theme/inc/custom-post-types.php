<?php
/**
 * Custom Post Types
 *
 * @package ProfAMR
 * @since 2.0.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Wiki Custom Post Type
 */
function profamr_register_wiki_post_type() {
    $labels = array(
        'name'                  => _x( 'Wiki', 'Post type general name', 'profamr' ),
        'singular_name'         => _x( 'Wiki Article', 'Post type singular name', 'profamr' ),
        'menu_name'             => _x( 'Wiki', 'Admin Menu text', 'profamr' ),
        'name_admin_bar'        => _x( 'Wiki Article', 'Add New on Toolbar', 'profamr' ),
        'add_new'               => __( 'Add New', 'profamr' ),
        'add_new_item'          => __( 'Add New Wiki Article', 'profamr' ),
        'new_item'              => __( 'New Wiki Article', 'profamr' ),
        'edit_item'             => __( 'Edit Wiki Article', 'profamr' ),
        'view_item'             => __( 'View Wiki Article', 'profamr' ),
        'all_items'             => __( 'All Wiki Articles', 'profamr' ),
        'search_items'          => __( 'Search Wiki Articles', 'profamr' ),
        'parent_item_colon'     => __( 'Parent Wiki Articles:', 'profamr' ),
        'not_found'             => __( 'No wiki articles found.', 'profamr' ),
        'not_found_in_trash'    => __( 'No wiki articles found in Trash.', 'profamr' ),
        'featured_image'        => _x( 'Wiki Article Cover Image', 'Overrides the "Featured Image" phrase', 'profamr' ),
        'set_featured_image'    => _x( 'Set cover image', 'Overrides the "Set featured image" phrase', 'profamr' ),
        'remove_featured_image' => _x( 'Remove cover image', 'Overrides the "Remove featured image" phrase', 'profamr' ),
        'use_featured_image'    => _x( 'Use as cover image', 'Overrides the "Use as featured image" phrase', 'profamr' ),
        'archives'              => _x( 'Wiki archives', 'The post type archive label used in nav menus', 'profamr' ),
        'insert_into_item'      => _x( 'Insert into wiki article', 'Overrides the "Insert into post"/"Insert into page" phrase', 'profamr' ),
        'uploaded_to_this_item' => _x( 'Uploaded to this wiki article', 'Overrides the "Uploaded to this post"/"Uploaded to this page" phrase', 'profamr' ),
        'filter_items_list'     => _x( 'Filter wiki articles list', 'Screen reader text for the filter links', 'profamr' ),
        'items_list_navigation' => _x( 'Wiki articles list navigation', 'Screen reader text for the pagination', 'profamr' ),
        'items_list'            => _x( 'Wiki articles list', 'Screen reader text for the items list', 'profamr' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'wiki', 'with_front' => false ),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => true,
        'menu_position'      => 5,
        'menu_icon'          => 'dashicons-book',
        'show_in_rest'       => true,
        'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments', 'revisions', 'page-attributes', 'custom-fields' ),
    );

    register_post_type( 'wiki', $args );
}
add_action( 'init', 'profamr_register_wiki_post_type' );

/**
 * Register Tools Custom Post Type (for OSINT tools, apps, etc.)
 */
function profamr_register_tools_post_type() {
    $labels = array(
        'name'                  => _x( 'Tools', 'Post type general name', 'profamr' ),
        'singular_name'         => _x( 'Tool', 'Post type singular name', 'profamr' ),
        'menu_name'             => _x( 'Tools', 'Admin Menu text', 'profamr' ),
        'name_admin_bar'        => _x( 'Tool', 'Add New on Toolbar', 'profamr' ),
        'add_new'               => __( 'Add New', 'profamr' ),
        'add_new_item'          => __( 'Add New Tool', 'profamr' ),
        'new_item'              => __( 'New Tool', 'profamr' ),
        'edit_item'             => __( 'Edit Tool', 'profamr' ),
        'view_item'             => __( 'View Tool', 'profamr' ),
        'all_items'             => __( 'All Tools', 'profamr' ),
        'search_items'          => __( 'Search Tools', 'profamr' ),
        'not_found'             => __( 'No tools found.', 'profamr' ),
        'not_found_in_trash'    => __( 'No tools found in Trash.', 'profamr' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'tools', 'with_front' => false ),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 6,
        'menu_icon'          => 'dashicons-admin-tools',
        'show_in_rest'       => true,
        'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments', 'custom-fields' ),
    );

    register_post_type( 'tools', $args );
}
add_action( 'init', 'profamr_register_tools_post_type' );

/**
 * Custom columns for Wiki post type
 */
function profamr_wiki_custom_columns( $columns ) {
    $columns = array(
        'cb'            => '<input type="checkbox" />',
        'title'         => __( 'Title', 'profamr' ),
        'wiki_category' => __( 'Category', 'profamr' ),
        'author'        => __( 'Author', 'profamr' ),
        'date'          => __( 'Date', 'profamr' ),
    );
    return $columns;
}
add_filter( 'manage_wiki_posts_columns', 'profamr_wiki_custom_columns' );

/**
 * Display custom column content
 */
function profamr_wiki_custom_column_content( $column, $post_id ) {
    switch ( $column ) {
        case 'wiki_category':
            $terms = get_the_terms( $post_id, 'wiki_category' );
            if ( ! empty( $terms ) ) {
                $output = array();
                foreach ( $terms as $term ) {
                    $output[] = sprintf(
                        '<a href="%s">%s</a>',
                        esc_url( add_query_arg( array( 'post_type' => get_post_type(), 'wiki_category' => $term->slug ), 'edit.php' ) ),
                        esc_html( $term->name )
                    );
                }
                echo implode( ', ', $output ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            } else {
                esc_html_e( 'No Category', 'profamr' );
            }
            break;
    }
}
add_action( 'manage_wiki_posts_custom_column', 'profamr_wiki_custom_column_content', 10, 2 );

/**
 * Make custom columns sortable
 */
function profamr_wiki_sortable_columns( $columns ) {
    $columns['wiki_category'] = 'wiki_category';
    return $columns;
}
add_filter( 'manage_edit-wiki_sortable_columns', 'profamr_wiki_sortable_columns' );
