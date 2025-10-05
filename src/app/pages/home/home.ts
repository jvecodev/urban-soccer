import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Header } from '../../components/organism/header/header';
import { FirstOrganism } from '../../components/organism/first-organism/first-organism';
import { Features } from '../../components/organism/new-features/new-features';
import { Footer } from '../../components/organism/footer/footer';
import { ScrollToTop } from '../../components/atoms/scroll-to-top/scroll-to-top';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterModule, Header, FirstOrganism, Features, Footer, ScrollToTop, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    templateUrl: './home.html',
    styleUrl: './home.scss'
})

/**
 * @class Home
 * @description Componente que exibe a página inicial do site com cabeçalho, seção principal, recursos e rodapé
 * @implements OnInit, OnDestroy, AfterViewInit
 * @property {ElementRef} homeContainer - Referência ao contêiner principal da página
 * @property {IntersectionObserver} observer - Observador para detectar quando os elementos entram na viewport
 * @property {Function} scrollListener - Listener para detectar eventos de scroll
 * @property {number} lastScrollY - Última posição Y do scroll para determinar a direção do scroll
 * @method ngOnInit - Inicializa o componente, configura o listener de scroll e o IntersectionObserver
 * @method ngAfterViewInit - Configura a observação dos elementos após a visualização ser inicializada e dispara animações de entrada
 * @method ngOnDestroy - Desconecta o IntersectionObserver e remove o listener de scroll ao destruir o componente
 * @method triggerEntranceAnimations - Dispara animações de entrada para os elementos principais
 * @method setupIntersectionObserver - Configura o IntersectionObserver para monitorar elementos específicos
 * @method observeElements - Inicia a observação dos elementos designados
 * @method setupScrollListener - Configura o listener para detectar a direção e velocidade do scroll, aplicando classes CSS apropriadas
 * 
 */

export class Home implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('homeContainer', { static: true }) homeContainer!: ElementRef;

    private observer!: IntersectionObserver;
    private scrollListener!: () => void;
    private lastScrollY = 0;

    ngOnInit() {
        this.setupScrollListener();
        this.setupIntersectionObserver();
    }

    ngAfterViewInit() {
        this.triggerEntranceAnimations();
        setTimeout(() => {
            this.observeElements();
        }, 100);
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
        }
    }

    private triggerEntranceAnimations() {
        const elements = document.querySelectorAll('app-header, app-first-organism');
        elements.forEach((element, index) => {
            const htmlElement = element as HTMLElement;
            htmlElement.style.opacity = '0';
            htmlElement.style.transform = 'translateY(30px)';

            setTimeout(() => {
                htmlElement.classList.add('animate-entrance');
            }, index * 150);
        });
    }

    private setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-10%',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target as HTMLElement;
                    element.classList.remove('animate-out-view');
                    element.offsetHeight;
                    element.classList.add('animate-in-view');
                } else {
                    const element = entry.target as HTMLElement;
                    element.classList.remove('animate-in-view');
                    element.offsetHeight;
                    element.classList.add('animate-out-view');
                }
            });
        }, options);
    }

    private observeElements() {
        const elementsToObserve = document.querySelectorAll('app-features, app-footer');
        elementsToObserve.forEach(element => {
            this.observer.observe(element);
        });
    }

    private setupScrollListener() {
        this.scrollListener = () => {
            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
            const scrollSpeed = Math.abs(currentScrollY - this.lastScrollY);

            const body = document.body;
            const allElements = document.querySelectorAll('app-features, app-footer, app-first-organism');

            if (scrollDirection === 'down') {
                body.classList.add('scrolling-down');
                body.classList.remove('scrolling-up');

                allElements.forEach((element, index) => {
                    const htmlElement = element as HTMLElement;
                    htmlElement.classList.add('scroll-down-effect');
                    htmlElement.classList.remove('scroll-up-effect');

                    htmlElement.style.animationDelay = `${index * 0.1}s`;
                });

            } else if (scrollDirection === 'up') {
                body.classList.add('scrolling-up');
                body.classList.remove('scrolling-down');

                allElements.forEach((element, index) => {
                    const htmlElement = element as HTMLElement;
                    htmlElement.classList.add('scroll-up-effect');
                    htmlElement.classList.remove('scroll-down-effect');

                    htmlElement.style.animationDelay = `${(allElements.length - index - 1) * 0.1}s`;
                });
            }

            if (scrollSpeed > 10) {
                body.classList.add('fast-scrolling');
                setTimeout(() => body.classList.remove('fast-scrolling'), 300);
            }

            this.lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', this.scrollListener, { passive: true });
    }
}
