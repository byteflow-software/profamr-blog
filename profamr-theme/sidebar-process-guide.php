<?php
/**
 * Sidebar for Process Guide (Guia do Processo)
 *
 * @package ProfAMR
 * @since 2.0.0
 */
?>

<aside class="sidebar-left">
    <h2 class="sidebar-left-title"><?php esc_html_e( 'Guia do Processo', 'profamr' ); ?></h2>

    <ul class="sidebar-left-menu">
        <li>
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
                <?php esc_html_e( 'Início', 'profamr' ); ?>
            </a>
        </li>

        <li>
            <div class="menu-item-toggle">
                <?php esc_html_e( 'Argumentação Jurídica', 'profamr' ); ?>
            </div>
            <ul class="sidebar-left-submenu">
                <li><a href="#"><?php esc_html_e( 'Fundamentos', 'profamr' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Técnicas', 'profamr' ); ?></a></li>
            </ul>
        </li>

        <li>
            <div class="menu-item-toggle">
                <?php esc_html_e( 'CNJ', 'profamr' ); ?>
            </div>
            <ul class="sidebar-left-submenu">
                <li><a href="#"><?php esc_html_e( 'Resoluções', 'profamr' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Provimentos', 'profamr' ); ?></a></li>
            </ul>
        </li>

        <li>
            <a href="#">
                <?php esc_html_e( 'Dicas Tecnologia', 'profamr' ); ?>
            </a>
        </li>

        <li>
            <a href="#">
                <?php esc_html_e( 'Foro de Prerrogativa de Função', 'profamr' ); ?>
            </a>
        </li>

        <li>
            <a href="#">
                <?php esc_html_e( 'Glossário Conhecimento', 'profamr' ); ?>
            </a>
        </li>

        <li>
            <a href="#">
                <?php esc_html_e( 'Glossário de Tecnologia', 'profamr' ); ?>
            </a>
        </li>

        <li>
            <div class="menu-item-toggle">
                <?php esc_html_e( 'Guia do Processo Penal Estratégico', 'profamr' ); ?>
            </div>
            <ul class="sidebar-left-submenu">
                <li><a href="#"><?php esc_html_e( 'Fase Policial', 'profamr' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Denúncia', 'profamr' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Instrução', 'profamr' ); ?></a></li>
            </ul>
        </li>

        <li>
            <div class="menu-item-toggle">
                <?php esc_html_e( 'Jurisprudência Selecionada', 'profamr' ); ?>
            </div>
            <ul class="sidebar-left-submenu">
                <li><a href="#"><?php esc_html_e( 'STF', 'profamr' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'STJ', 'profamr' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'TRF', 'profamr' ); ?></a></li>
            </ul>
        </li>

        <li>
            <div class="menu-item-toggle">
                <?php esc_html_e( 'Legislação', 'profamr' ); ?>
            </div>
            <ul class="sidebar-left-submenu">
                <li><a href="#"><?php esc_html_e( 'Códigos', 'profamr' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Leis Especiais', 'profamr' ); ?></a></li>
            </ul>
        </li>

        <li>
            <a href="#">
                <?php esc_html_e( 'RoadMapCrime [RMCr]', 'profamr' ); ?>
            </a>
        </li>

        <?php
        // Link para Wiki se existir
        $wiki_link = get_post_type_archive_link( 'yada_wiki' );
        if ( $wiki_link ) :
            ?>
            <li>
                <a href="<?php echo esc_url( $wiki_link ); ?>">
                    <?php esc_html_e( 'Wiki', 'profamr' ); ?>
                </a>
            </li>
        <?php endif; ?>
    </ul>
</aside>
