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
}
