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
        // Animação instantânea ao entrar na home
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
                    // Remover classes anteriores para permitir reanimação
                    element.classList.remove('animate-out-view');
                    // Forçar reflow para garantir que a classe seja removida
                    element.offsetHeight;
                    // Adicionar nova animação
                    element.classList.add('animate-in-view');
                } else {
                    const element = entry.target as HTMLElement;
                    // Remover classes anteriores para permitir reanimação
                    element.classList.remove('animate-in-view');
                    // Forçar reflow
                    element.offsetHeight;
                    // Adicionar animação de saída
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

            // Atualizar classes baseado na direção do scroll
            const body = document.body;
            const allElements = document.querySelectorAll('app-features, app-footer, app-first-organism');

            if (scrollDirection === 'down') {
                body.classList.add('scrolling-down');
                body.classList.remove('scrolling-up');

                // Adicionar efeito de scroll para baixo nos elementos
                allElements.forEach((element, index) => {
                    const htmlElement = element as HTMLElement;
                    htmlElement.classList.add('scroll-down-effect');
                    htmlElement.classList.remove('scroll-up-effect');

                    // Adicionar delay baseado na posição do elemento
                    htmlElement.style.animationDelay = `${index * 0.1}s`;
                });

            } else if (scrollDirection === 'up') {
                body.classList.add('scrolling-up');
                body.classList.remove('scrolling-down');

                // Adicionar efeito de scroll para cima nos elementos
                allElements.forEach((element, index) => {
                    const htmlElement = element as HTMLElement;
                    htmlElement.classList.add('scroll-up-effect');
                    htmlElement.classList.remove('scroll-down-effect');

                    // Adicionar delay baseado na posição do elemento (inverso)
                    htmlElement.style.animationDelay = `${(allElements.length - index - 1) * 0.1}s`;
                });
            }

            // Adicionar classe de velocidade baseada na velocidade do scroll
            if (scrollSpeed > 10) {
                body.classList.add('fast-scrolling');
                setTimeout(() => body.classList.remove('fast-scrolling'), 300);
            }

            this.lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', this.scrollListener, { passive: true });
    }
}
