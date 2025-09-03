import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    styleUrls: ['./header.scss'],
    standalone: true,
    imports: [Toolbar, AvatarModule, ButtonModule, RouterModule, CommonModule]
})
export class Header implements OnInit {
    isMobileMenuOpen = false;

    ngOnInit() {}



    scrollToSection(sectionId: string): void {

        setTimeout(() => {
            let element = document.getElementById(sectionId);



            if (element) {

                const headerCard = document.querySelector('.card') as HTMLElement;
                const toolbar = document.querySelector('p-toolbar') as HTMLElement;

                let headerHeight = 120; // Valor padrão

                if (headerCard) {
                    headerHeight = headerCard.offsetHeight + 20;
                } else if (toolbar) {
                    headerHeight = toolbar.offsetHeight + 20;
                }

                const elementRect = element.getBoundingClientRect();
                const currentScrollY = window.scrollY;
                const targetPosition = currentScrollY + elementRect.top - headerHeight;


                window.scrollTo({
                    top: Math.max(0, targetPosition), // Garantir que não seja negativo
                    behavior: 'smooth'
                });

            } else {
                console.error('❌ Elemento não encontrado com ID:', sectionId);
                const allElements = document.querySelectorAll('[id]');
                allElements.forEach(el => console.log('  -', el.id, el));
            }

            this.closeMobileMenu();
        }, 100);
    }

    scrollToTop(): void {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        if (this.isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen = false;
        document.body.style.overflow = 'unset';
    }

    navigateAndClose(sectionId: string): void {
        this.scrollToSection(sectionId);
        this.closeMobileMenu();
    }
}
