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
export class UserAvatar {
  @Input() username: string = '';
  @Input() clickable: boolean = true;
  @Input() size: 'small' | 'default' | 'large' | 'extra-large' = 'default';

  // Computed para pegar a inicial do nome
  userInitial = computed(() => {
    return this.username?.charAt(0)?.toUpperCase() || '?';
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
