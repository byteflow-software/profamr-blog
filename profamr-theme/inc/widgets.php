<?php
/**
 * Custom Widgets
 *
 * @package ProfAMR
 * @since 2.0.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Recent Wiki Articles Widget
 */
class ProfAMR_Recent_Wiki_Widget extends WP_Widget {

    public function __construct() {
        parent::__construct(
            'profamr_recent_wiki',
            __( 'Recent Wiki Articles', 'profamr' ),
            array( 'description' => __( 'Display recent wiki articles', 'profamr' ) )
        );
    }

    public function widget( $args, $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Recent Wiki Articles', 'profamr' );
        $number = ! empty( $instance['number'] ) ? absint( $instance['number'] ) : 5;

        echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

        if ( ! empty( $title ) ) {
            echo $args['before_title'] . esc_html( apply_filters( 'widget_title', $title ) ) . $args['after_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        }

        $wiki_query = new WP_Query( array(
            'post_type'      => 'wiki',
            'posts_per_page' => $number,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ) );

        if ( $wiki_query->have_posts() ) {
            echo '<ul>';
            while ( $wiki_query->have_posts() ) {
                $wiki_query->the_post();
                echo '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
            }
            echo '</ul>';
            wp_reset_postdata();
        } else {
            echo '<p>' . esc_html__( 'No wiki articles found.', 'profamr' ) . '</p>';
        }

        echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }

    public function form( $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Recent Wiki Articles', 'profamr' );
        $number = ! empty( $instance['number'] ) ? absint( $instance['number'] ) : 5;
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'profamr' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>"><?php esc_html_e( 'Number of articles to show:', 'profamr' ); ?></label>
            <input class="tiny-text" id="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'number' ) ); ?>" type="number" step="1" min="1" value="<?php echo esc_attr( $number ); ?>" size="3">
        </p>
        <?php
    }

    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['title'] = ! empty( $new_instance['title'] ) ? sanitize_text_field( $new_instance['title'] ) : '';
        $instance['number'] = ! empty( $new_instance['number'] ) ? absint( $new_instance['number'] ) : 5;
        return $instance;
    }
}

/**
 * Wiki Categories Widget
 */
class ProfAMR_Wiki_Categories_Widget extends WP_Widget {

    public function __construct() {
        parent::__construct(
            'profamr_wiki_categories',
            __( 'Wiki Categories', 'profamr' ),
            array( 'description' => __( 'Display wiki categories', 'profamr' ) )
        );
    }

    public function widget( $args, $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Wiki Categories', 'profamr' );

        echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

        if ( ! empty( $title ) ) {
            echo $args['before_title'] . esc_html( apply_filters( 'widget_title', $title ) ) . $args['after_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        }

        $terms = get_terms( array(
            'taxonomy'   => 'wiki_category',
            'hide_empty' => true,
        ) );

        if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
            echo '<ul>';
            foreach ( $terms as $term ) {
                echo '<li><a href="' . esc_url( get_term_link( $term ) ) . '">' . esc_html( $term->name ) . ' <span class="count">(' . absint( $term->count ) . ')</span></a></li>';
            }
            echo '</ul>';
        } else {
            echo '<p>' . esc_html__( 'No categories found.', 'profamr' ) . '</p>';
        }

        echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }

    public function form( $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Wiki Categories', 'profamr' );
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'profamr' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <?php
    }

    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['title'] = ! empty( $new_instance['title'] ) ? sanitize_text_field( $new_instance['title'] ) : '';
        return $instance;
    }
}

/**
 * Register widgets
 */
function profamr_register_widgets() {
    register_widget( 'ProfAMR_Recent_Wiki_Widget' );
    register_widget( 'ProfAMR_Wiki_Categories_Widget' );
}
add_action( 'widgets_init', 'profamr_register_widgets' );
