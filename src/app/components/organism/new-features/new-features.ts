import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-features',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './new-features.html',
    styleUrl: './new-features.scss'
})
export class Features implements OnInit, OnDestroy, AfterViewInit {
    private observer!: IntersectionObserver;

    constructor(private elementRef: ElementRef) {}

    ngOnInit() {
        this.setupIntersectionObserver();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.observeFeatureElements();
        }, 100);
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target as HTMLElement;
                    // Remover classes anteriores para permitir reanimação
                    element.classList.remove('animate-out-view');
                    element.style.animationPlayState = 'running';

                    // Forçar reflow para garantir que a classe seja removida
                    element.offsetHeight;

                    // Adicionar nova animação
                    element.classList.add('animate-in-view');

                    // Adicionar efeito especial para cards
                    if (element.classList.contains('feature-card')) {
                        element.classList.add('card-visible');
                        // Reativar animação do card
                        this.reactivateCardAnimation(element);
                    }
                } else {
                    const element = entry.target as HTMLElement;
                    element.classList.remove('animate-in-view', 'card-visible');
                    element.offsetHeight;
                    element.classList.add('animate-out-view');
                }
            });
        }, options);
    }

    private reactivateCardAnimation(cardElement: HTMLElement) {
        // Reativar animação dos ícones dentro do card
        const icon = cardElement.querySelector('.feature-icon');
        if (icon) {
            const htmlIcon = icon as HTMLElement;
            htmlIcon.classList.remove('animate-icon');
            htmlIcon.offsetHeight; // Forçar reflow
            htmlIcon.classList.add('animate-icon');
        }
    }

    private observeFeatureElements() {
        const elementsToObserve = this.elementRef.nativeElement.querySelectorAll(
            '.animate-features-title, .animate-features-subtitle, .feature-card, .testimonial-section'
        );

        elementsToObserve.forEach((element: HTMLElement) => {
            element.style.animationPlayState = 'paused';
            this.observer.observe(element);
        });
    }
}
