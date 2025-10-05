import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-avatar"
         [class.size-small]="size === 'small'"
         [class.size-large]="size === 'large'"
         [class.size-extra-large]="size === 'extra-large'"
         [class.not-clickable]="!clickable"
         [style.background-color]="avatarColor()"
         (click)="onAvatarClick()"
         [title]="username">
      <span class="avatar-initial">{{ userInitial() }}</span>
    </div>
  `,
  styleUrls: ['./user-avatar.scss']
})

/**
 * @class UserAvatar
 * @description Componente que exibe um avatar de usuário com a inicial do nome e uma cor gerada
 * @property {string} username - Nome do usuário para gerar a inicial e a cor do avatar
 * @property {boolean} clickable - Define se o avatar é clicável (navega para o dashboard)
 * @property {'small' | 'default' | 'large' | 'extra-large'} size - Tamanho do avatar
 * @method onAvatarClick - Navega para o dashboard se o avatar for clicável
 * ...
 */

export class UserAvatar {
  @Input() username: string = '';
  @Input() clickable: boolean = true;
  @Input() size: 'small' | 'default' | 'large' | 'extra-large' = 'default';

  // Computed para pegar a inicial do nome
  userInitial = computed(() => {
    const initial = this.username?.charAt(0)?.toUpperCase() || '?';
    return initial;
  });

  // Computed para gerar cor baseada no nome
  avatarColor = computed(() => {
    const colors = [
      '#EB6E19', // Laranja Vibrante
      '#F4A028', // Amarelo Dourado
      '#30C9F9', // Ciano Elétrico
      '#1095CF', // Azul Acento
      '#7C2C78', // Roxo Urbano
    ];

    if (!this.username) return colors[0];

    const index = this.username.charCodeAt(0) % colors.length;
    return colors[index];
  });

  constructor(private router: Router) {}

  onAvatarClick(): void {
    if (this.clickable) {
      this.router.navigate(['/dashboard']);
    }
  }
}
