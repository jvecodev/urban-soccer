import { Component, computed, signal, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-first-organism',
    standalone: true,
    imports: [ButtonModule, RippleModule, CommonModule],
    templateUrl: './first-organism.html',
    styleUrl: './first-organism.scss'
})
export class FirstOrganism implements OnInit, OnDestroy {
  private userSignal = signal<any>(null);
  private userSubscription?: Subscription;

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.userSignal());

  buttonText = computed(() =>
    this.isAuthenticated() ? 'Criar Meu Jogador' : 'Entrar para Jogar'
  );

  welcomeMessage = computed(() => {
    const user = this.currentUser();
    if (this.isAuthenticated() && user?.username) {
      return `Bem-vindo, ${user.username}!`;
    }
    return 'Bem-vindo ao Urban Soccer';
  });

  constructor(
    private router: Router,
    private authService: Auth
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.userSignal.set(currentUser);

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userSignal.set(user);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  navigateToPlayerSelection() {
    // Verifica se o usuário está autenticado
    if (this.authService.isAuthenticated()) {
      // Se estiver autenticado, vai para a seleção de jogador
      this.router.navigate(['/player-selection']);
    } else {
      // Se não estiver autenticado, vai para o login
      this.router.navigate(['/login']);
    }
  }
}
