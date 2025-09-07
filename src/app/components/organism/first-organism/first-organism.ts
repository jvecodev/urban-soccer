import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';

@Component({
    selector: 'app-first-organism',
    standalone: true,
    imports: [ButtonModule, RippleModule, CommonModule],
    templateUrl: './first-organism.html',
    styleUrl: './first-organism.scss'
})
export class FirstOrganism {
  // Computed para verificar se está autenticado
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Computed para o texto do botão
  buttonText = computed(() =>
    this.isAuthenticated() ? 'Criar Meu Jogador' : 'Entrar para Jogar'
  );

  constructor(
    private router: Router,
    private authService: Auth
  ) {}

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
