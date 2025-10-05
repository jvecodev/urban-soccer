import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() text: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() class: string = '';

  @Output() onClick = new EventEmitter<Event>();

  /**
   * @method handleClick
   * @param event - Evento do clique
   * @returns void
   * @description Emite o evento de clique se o botão não estiver desabilitado
   */

  handleClick(event: Event): void {
    if (!this.disabled) {
      this.onClick.emit(event);
    }
  }
}
