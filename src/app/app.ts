import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ButtonModule,
    ToastModule,
    CommonModule
],
  templateUrl: './app.html',
  styleUrls: ['./app.scss', './shared/toast-styles.scss']
})
export class App implements OnInit, OnDestroy {
  protected title = 'urban-soccer';
  public showHeader = false; // Iniciar como false para evitar flash
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Verificar estado inicial após o Angular ter inicializado completamente
    setTimeout(() => {
      this.updateHeaderVisibility();
    }, 0);

    // Escutar mudanças de rota
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderVisibility();
      });
  }

  private updateHeaderVisibility(): void {
    const currentUrl = this.router.url;
    // Ocultar header nas páginas de loading, login e signup
    this.showHeader = !(currentUrl === '/loading' || currentUrl === '/login' || currentUrl === '/signup' || currentUrl === '/' || currentUrl === '');
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
