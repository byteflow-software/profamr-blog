<?php
/**
 * The sidebar containing the main widget area
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Newsmatic
 * @since 1.0.0
 */

if (!is_active_sidebar('sidebar-1')) {
	return;
}
?>

<?php if (strpos($_SERVER['REQUEST_URI'], '/wiki') === false): ?>
	<aside id="secondary" class="widget-area">
		<?php dynamic_sidebar('sidebar-1'); ?>
	</aside><!-- #secondary -->
<?php endif; ?>
<?php if (strpos($_SERVER['REQUEST_URI'], '/wiki') !== false): ?>
	<style>
		.widget ul li:before,
		.widget ol li:before {
			opacity: 0 !important;
		}

		.wiki-sidebar .wiki-tree ul.children {
			margin-left: 22px !important;
		}

		.widget ul li,
		.widget ol li {
			padding: 9px 0 9px 0;
		}

		h2.newsmatic-block-title, h2.newsmatic-widget-title, h2.widget-title {
			margin-bottom: 0 !important;
		}
	</style>
	<aside id="secondary" class="widget-area wiki-sidebar">
		<div class="widget widget_categories">
			<h2 class="widget-title">Guia do Processo</h2>
			<ul class="wiki-tree">
				<?php
				// Parâmetros para wp_list_categories
				$args = array(
					'orderby' => 'name',
					'order' => 'ASC',
					'show_count' => 0,
					'hide_empty' => 0,
					'use_desc_for_title' => 0,
					'child_of' => 0,
					'hierarchical' => 1,
					'title_li' => '',
					'depth' => 0,
					'taxonomy' => 'wiki_cats',
				);

				wp_list_categories($args);
				?>
			</ul>
		</div><!-- .widget_categories -->

		<?php dynamic_sidebar('sidebar-yada_wiki'); // Permite adicionar widgets via painel do WordPress ?>
	</aside>
<?php endif; ?>