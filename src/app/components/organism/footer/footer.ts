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
          // Remover classes anteriores para permitir reanimação
          element.classList.remove('animate-out-view');
          element.style.animationPlayState = 'running';

          // Forçar reflow
          element.offsetHeight;

          // Adicionar nova animação
          element.classList.add('animate-in-view');

          // Adicionar classes especiais para efeitos visuais
          if (element.classList.contains('animate-footer-social')) {
            element.classList.add('social-visible');
            // Reativar animação dos links sociais
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
    // Reativar animações dos elementos sociais
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

    // Validação básica
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      return;
    }

    this.isSubmitting = true;

    try {
      // Envia o formulário para FormSubmit
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Limpa o formulário
        this.formData = { name: '', email: '', message: '' };
        form.reset();
        // Mostra o modal de sucesso
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
}
