import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-scroll-to-top',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './scroll-to-top.html',
    styleUrl: './scroll-to-top.scss'
})

/**
 * @class ScrollToTop
 * @description Componente que exibe um botão para rolar a página para o topo quando o usuário rola para baixo
 * @implements OnInit, OnDestroy
 * @method ngOnInit - Inicializa o componente e verifica a posição de rolagem
 * @method ngOnDestroy - Limpa os listeners ao destruir o componente
 */

export class ScrollToTop implements OnInit, OnDestroy {
    isVisible = false;

    ngOnInit() {
        this.checkScrollPosition();
    }

    ngOnDestroy() {
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.checkScrollPosition();
    }

    private checkScrollPosition() {
        this.isVisible = window.pageYOffset > 300;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
