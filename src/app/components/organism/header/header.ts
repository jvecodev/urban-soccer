import { Component, OnInit, AfterViewInit, computed, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Auth } from '../../../services/auth';
import { Subscription } from 'rxjs';
import { UserAvatar } from '../../atoms/user-avatar/user-avatar';

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    styleUrls: ['./header.scss'],
    standalone: true,
    imports: [Toolbar, AvatarModule, ButtonModule, RouterModule, CommonModule, MenuModule, UserAvatar]
})
export class Header implements OnInit, OnDestroy {
    isMobileMenuOpen = false;
    private userSubscription?: Subscription;

    // Signals para gerenciar estado de autenticação
    private userSignal = signal<any>(null);
    isAuthenticated = computed(() => !!this.userSignal() && this.authService.isAuthenticated());
    currentUser = computed(() => this.userSignal());

    // Items do menu do usuário
    userMenuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => this.router.navigate(['/dashboard'])
        },
        {
            label: 'Criar Jogador',
            icon: 'pi pi-user-plus',
            command: () => this.router.navigate(['/player-selection'])
        },
        {
            separator: true
        },
        {
            label: 'Sair',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
        }
    ];

    constructor(
        private authService: Auth,
        private router: Router
    ) {}

    ngOnInit() {
        // Inicializa o signal com o usuário atual
        this.userSignal.set(this.authService.getCurrentUser());

        // Assina mudanças no estado do usuário
        this.userSubscription = this.authService.currentUser$.subscribe(user => {
            this.userSignal.set(user);
        });
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/home']);
        this.closeMobileMenu();
    }



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
