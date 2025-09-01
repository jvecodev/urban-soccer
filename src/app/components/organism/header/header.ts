import { Component } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Button } from '../../atoms/button/button';

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    styleUrls: ['./header.scss'],
    standalone: true,
    imports: [Toolbar, AvatarModule, ButtonModule, Button]
})
export class Header {
    isMobileMenuOpen = false;

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerHeight = 100;
            const targetPosition = element.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    scrollToTop(): void {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        // Previne scroll do body quando menu está aberto
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
