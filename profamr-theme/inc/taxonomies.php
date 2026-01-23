<?php
/**
 * Custom Taxonomies
 *
 * @package ProfAMR
 * @since 2.0.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Wiki Category Taxonomy
 */
function profamr_register_wiki_category_taxonomy() {
    $labels = array(
        'name'                       => _x( 'Wiki Categories', 'taxonomy general name', 'profamr' ),
        'singular_name'              => _x( 'Wiki Category', 'taxonomy singular name', 'profamr' ),
        'search_items'               => __( 'Search Wiki Categories', 'profamr' ),
        'popular_items'              => __( 'Popular Wiki Categories', 'profamr' ),
        'all_items'                  => __( 'All Wiki Categories', 'profamr' ),
        'parent_item'                => __( 'Parent Wiki Category', 'profamr' ),
        'parent_item_colon'          => __( 'Parent Wiki Category:', 'profamr' ),
        'edit_item'                  => __( 'Edit Wiki Category', 'profamr' ),
        'update_item'                => __( 'Update Wiki Category', 'profamr' ),
        'add_new_item'               => __( 'Add New Wiki Category', 'profamr' ),
        'new_item_name'              => __( 'New Wiki Category Name', 'profamr' ),
        'separate_items_with_commas' => __( 'Separate categories with commas', 'profamr' ),
        'add_or_remove_items'        => __( 'Add or remove categories', 'profamr' ),
        'choose_from_most_used'      => __( 'Choose from the most used categories', 'profamr' ),
        'not_found'                  => __( 'No categories found.', 'profamr' ),
        'menu_name'                  => __( 'Wiki Categories', 'profamr' ),
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'wiki-category', 'with_front' => false ),
        'show_in_rest'      => true,
    );

    register_taxonomy( 'wiki_category', array( 'yada_wiki' ), $args );
}
add_action( 'init', 'profamr_register_wiki_category_taxonomy' );

/**
 * Register Wiki Tags Taxonomy
 */
function profamr_register_wiki_tags_taxonomy() {
    $labels = array(
        'name'                       => _x( 'Wiki Tags', 'taxonomy general name', 'profamr' ),
        'singular_name'              => _x( 'Wiki Tag', 'taxonomy singular name', 'profamr' ),
        'search_items'               => __( 'Search Wiki Tags', 'profamr' ),
        'popular_items'              => __( 'Popular Wiki Tags', 'profamr' ),
        'all_items'                  => __( 'All Wiki Tags', 'profamr' ),
        'edit_item'                  => __( 'Edit Wiki Tag', 'profamr' ),
        'update_item'                => __( 'Update Wiki Tag', 'profamr' ),
        'add_new_item'               => __( 'Add New Wiki Tag', 'profamr' ),
        'new_item_name'              => __( 'New Wiki Tag Name', 'profamr' ),
        'separate_items_with_commas' => __( 'Separate tags with commas', 'profamr' ),
        'add_or_remove_items'        => __( 'Add or remove tags', 'profamr' ),
        'choose_from_most_used'      => __( 'Choose from the most used tags', 'profamr' ),
        'not_found'                  => __( 'No tags found.', 'profamr' ),
        'menu_name'                  => __( 'Wiki Tags', 'profamr' ),
    );

    $args = array(
        'hierarchical'      => false,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'wiki-tag', 'with_front' => false ),
        'show_in_rest'      => true,
    );

    register_taxonomy( 'wiki_tag', array( 'yada_wiki' ), $args );
}
add_action( 'init', 'profamr_register_wiki_tags_taxonomy' );

/**
 * Register Tool Type Taxonomy
 */
function profamr_register_tool_type_taxonomy() {
    $labels = array(
        'name'                       => _x( 'Tool Types', 'taxonomy general name', 'profamr' ),
        'singular_name'              => _x( 'Tool Type', 'taxonomy singular name', 'profamr' ),
        'search_items'               => __( 'Search Tool Types', 'profamr' ),
        'popular_items'              => __( 'Popular Tool Types', 'profamr' ),
        'all_items'                  => __( 'All Tool Types', 'profamr' ),
        'parent_item'                => __( 'Parent Tool Type', 'profamr' ),
        'parent_item_colon'          => __( 'Parent Tool Type:', 'profamr' ),
        'edit_item'                  => __( 'Edit Tool Type', 'profamr' ),
        'update_item'                => __( 'Update Tool Type', 'profamr' ),
        'add_new_item'               => __( 'Add New Tool Type', 'profamr' ),
        'new_item_name'              => __( 'New Tool Type Name', 'profamr' ),
        'menu_name'                  => __( 'Tool Types', 'profamr' ),
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'tool-type', 'with_front' => false ),
        'show_in_rest'      => true,
    );

    register_taxonomy( 'tool_type', array( 'tools' ), $args );
}
add_action( 'init', 'profamr_register_tool_type_taxonomy' );

/**
 * Add default Wiki categories
 */
function profamr_add_default_wiki_categories() {
    if ( ! term_exists( 'OSINT', 'wiki_category' ) ) {
        wp_insert_term(
            'OSINT',
            'wiki_category',
            array(
                'description' => __( 'Open Source Intelligence tools and techniques', 'profamr' ),
                'slug'        => 'osint',
            )
        );
    }

    if ( ! term_exists( 'Security', 'wiki_category' ) ) {
        wp_insert_term(
            'Security',
            'wiki_category',
            array(
                'description' => __( 'Security tools and practices', 'profamr' ),
                'slug'        => 'security',
            )
        );
    }

    if ( ! term_exists( 'Legal Tech', 'wiki_category' ) ) {
        wp_insert_term(
            'Legal Tech',
            'wiki_category',
            array(
                'description' => __( 'Technology for legal professionals', 'profamr' ),
                'slug'        => 'legal-tech',
            )
        );
    }

    if ( ! term_exists( 'Tools', 'wiki_category' ) ) {
        wp_insert_term(
            'Tools',
            'wiki_category',
            array(
                'description' => __( 'Software tools and applications', 'profamr' ),
                'slug'        => 'tools',
            )
        );
    }

    if ( ! term_exists( 'Tutorials', 'wiki_category' ) ) {
        wp_insert_term(
            'Tutorials',
            'wiki_category',
            array(
                'description' => __( 'Step-by-step tutorials and guides', 'profamr' ),
                'slug'        => 'tutorials',
            )
        );
    }
}
add_action( 'init', 'profamr_add_default_wiki_categories' );

/**
 * Add default tool types
 */
function profamr_add_default_tool_types() {
    $tool_types = array(
        'OSINT'         => __( 'OSINT tools for information gathering', 'profamr' ),
        'Analysis'      => __( 'Analysis and investigation tools', 'profamr' ),
        'Web'           => __( 'Web-based tools and applications', 'profamr' ),
        'AI/ML'         => __( 'Artificial Intelligence and Machine Learning tools', 'profamr' ),
        'Productivity'  => __( 'Productivity and utility tools', 'profamr' ),
    );

    foreach ( $tool_types as $name => $description ) {
        if ( ! term_exists( $name, 'tool_type' ) ) {
            wp_insert_term(
                $name,
                'tool_type',
                array(
                    'description' => $description,
                    'slug'        => sanitize_title( $name ),
                )
            );
        }
    }
}
add_action( 'init', 'profamr_add_default_tool_types' );
