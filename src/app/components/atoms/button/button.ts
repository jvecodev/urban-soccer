import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'newsletter';
export type ButtonSize = 'small' | 'large';
export type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'help' | 'danger' | 'contrast';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [ButtonModule, CommonModule, RouterModule],
  templateUrl: './button.html',
  styleUrl: './button.scss'
})
export class Button {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize | undefined = undefined;
  @Input() severity: ButtonSeverity = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() rounded: boolean = false;
  @Input() raised: boolean = false;
  @Input() text: boolean = false;
  @Input() outlined: boolean = false;
  @Input() plain: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() customClass: string = '';
  @Input() fullWidth: boolean = false;
  @Input() routerLink: string | null = null;

  @Output() onClick = new EventEmitter<Event>();

  onButtonClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }

  get buttonClasses(): string {
    const classes = [
      'urban-button',
      `urban-button--${this.variant}`,
      this.customClass
    ];

    if (this.size) {
      classes.push(`urban-button--${this.size}`);
    }

    if (this.fullWidth) {
      classes.push('urban-button--full-width');
    }

    if (this.disabled) {
      classes.push('urban-button--disabled');
    }

    if (this.loading) {
      classes.push('urban-button--loading');
    }

    return classes.filter(Boolean).join(' ');
  }
}
