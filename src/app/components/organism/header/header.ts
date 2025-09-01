import { Component } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Button } from '../../atoms/button/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    styleUrls: ['./header.scss'],
    standalone: true,
    imports: [Toolbar, AvatarModule, ButtonModule, Button, RouterModule, CommonModule]
})
export class Header {
    isMobileMenuOpen = false;

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen = false;
    }

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
        this.closeMobileMenu(); 
    }

    scrollToTop(): void {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
