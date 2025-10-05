import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-modal.html',
  styleUrl: './terms-modal.scss'
})

/**
 * @class TermsModal
 * @description Componente que exibe um modal com os termos de uso ou política de privacidade
 * @property {boolean} isVisible - Indica se o modal está visível
 * @property {'terms' | 'privacy'} modalType - Tipo do modal (termos de uso ou política de privacidade)
 * @property {EventEmitter<void>} closeModal - Evento emitido quando o modal é fechado
 * @method onCloseModal - Emite o evento para fechar o modal
 * @method onModalBackdropClick - Fecha o modal ao clicar no backdrop
 * @method onModalContentClick - Impede o fechamento do modal ao clicar no conteúdo
 
 */

export class TermsModal {
  @Input() isVisible: boolean = false;
  @Input() modalType: 'terms' | 'privacy' = 'terms';
  @Output() closeModal = new EventEmitter<void>();

  get modalTitle(): string {
    return this.modalType === 'terms' ? 'TERMOS DE USO' : 'POLÍTICA DE PRIVACIDADE';
  }

  get modalContent(): { title: string; content: string[] }[] {
    if (this.modalType === 'terms') {
      return this.getTermsContent();
    } else {
      return this.getPrivacyContent();
    }
  }

  private getTermsContent(): { title: string; content: string[] }[] {
    return [
      {
        title: '🚫 REGRA NÚMERO 1: NÃO DÊ RAGE!',
        content: [
          'Perdeu o gol? Tomou uma caneta? O goleiro defendeu seu chute "imparável"? Respire fundo, conte até 10 e lembre-se: é só um jogo (que você leva MUITO a sério).',
        ]
      },
      {
        title: '⚽ CONDUTA EM CAMPO',
        content: [
          'Não seja "aquele cara" que reclama de cada lance. Todo mundo sabe que você é bom, não precisa provar gritando.',
        ]
      }
    ];
  }

  private getPrivacyContent(): { title: string; content: string[] }[] {
    return [
      {
        title: '🔒 PROTEÇÃO DOS SEUS DADOS',
        content: [

          'Não vendemos suas informações para ninguém, nem mesmo para o técnico da seleção que está procurando talentos.',
        ]
      },
      {
        title: '📊 COLETA DE INFORMAÇÕES',
        content: [
          'Coletamos apenas o necessário: nome, email, posição preferida e se você realmente sabe chutar com a perna esquerda.',
          'Guardamos histórico de partidas para você poder se gabar dos gols que fez há 3 meses.'
        ]
      }
    ];
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onModalBackdropClick(event: Event): void {
    event.stopPropagation();
    this.onCloseModal();
  }

  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }
}
