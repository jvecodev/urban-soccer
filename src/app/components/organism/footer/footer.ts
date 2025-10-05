import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TermsModal } from '../terms-modal/terms-modal';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, TermsModal],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})

/**
 * @class Footer
 * @description Componente que exibe o rodapé do site com links, informações de contato e um formulário de contato
 * @implements OnInit, OnDestroy, AfterViewInit
 * @property {boolean} showModal - Indica se o modal de sucesso está visível
 * @property {boolean} isSubmitting - Indica se o formulário está sendo enviado
 * @property {boolean} showTermsModal - Indica se o modal de termos está visível
 * @property {boolean} showPrivacyModal - Indica se o modal de privacidade está visível
 * @property {IntersectionObserver} observer - Observador para detectar quando os elementos do rodapé entram na viewport
 * @property {object} formData - Dados do formulário de contato
 * @method ngOnInit - Inicializa o componente e configura o IntersectionObserver
 * @method ngAfterViewInit - Configura a observação dos elementos do rodapé após a visualização ser inicializada
 * @method ngOnDestroy - Desconecta o IntersectionObserver ao destruir o componente
 * @method onSubmit - Manipula o envio do formulário de contato
 * @method closeModal - Fecha o modal de sucesso
 * @method onModalBackdropClick - Fecha o modal ao clicar no backdrop
 * @method onModalContentClick - Impede o fechamento do modal ao clicar no conteúdo
 * @method openTermsModal - Abre o modal de termos
 * @method closeTermsModal - Fecha o modal de termos
 * @method openPrivacyModal - Abre o modal de privacidade
 * @method closePrivacyModal - Fecha o modal de privacidade
 * @method navigateTo
 */

export class Footer implements OnInit, OnDestroy, AfterViewInit {
  showModal = false;
  isSubmitting = false;
  showTermsModal: boolean = false;
  showPrivacyModal: boolean = false;
  private observer!: IntersectionObserver;

  formData = {
    name: '',
    email: '',
    message: '',
  };

  constructor(public router: Router, private elementRef: ElementRef) {}

  ngOnInit() {
    this.setupIntersectionObserver();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.observeFooterElements();
    }, 100);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.classList.remove('animate-out-view');
          element.style.animationPlayState = 'running';

          element.offsetHeight;

          element.classList.add('animate-in-view');

          if (element.classList.contains('animate-footer-social')) {
            element.classList.add('social-visible');
            this.reactivateSocialAnimations(element);
          }
        } else {
          const element = entry.target as HTMLElement;
          element.classList.remove('animate-in-view', 'social-visible');
          element.offsetHeight;
          element.classList.add('animate-out-view');
        }
      });
    }, options);
  }

  private reactivateSocialAnimations(element: HTMLElement) {
    setTimeout(() => {
      element.style.transform = 'scale(1.05)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }, 100);
  }

  private observeFooterElements() {
    const elementsToObserve = this.elementRef.nativeElement.querySelectorAll(
      '.animate-footer-brand, .animate-footer-nav, .animate-footer-social, .animate-footer-link, .animate-footer-bottom'
    );

    elementsToObserve.forEach((element: HTMLElement) => {
      element.style.animationPlayState = 'paused';
      this.observer.observe(element);
    });
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      return;
    }

    this.isSubmitting = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        this.formData = { name: '', email: '', message: '' };
        form.reset();
        this.showModal = true;
      } else {
        console.error('Erro ao enviar formulário');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  onModalBackdropClick(event: Event): void {
    event.stopPropagation();
    this.closeModal();
  }

  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  openTermsModal(): void {
        this.showTermsModal = true;
    }

    closeTermsModal(): void {
        this.showTermsModal = false;
    }

    openPrivacyModal(): void {
        this.showPrivacyModal = true;
    }

    closePrivacyModal(): void {
        this.showPrivacyModal = false;
    }

    navigateToFaq(): void {
        this.router.navigate(['/faq']);
    }
}
