import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FaqService, FaqLog } from '../../services/faq.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss']
})
export class Faq implements OnInit, OnDestroy {
  question: string = '';
  currentQuestion: string = '';
  currentAnswer: string = '';
  isLoading: boolean = false;
  isStreaming: boolean = false;
  history: FaqLog[] = [];
  showHistory: boolean = false;

  // Modal de confirmação
  showDeleteModal: boolean = false;
  itemToDelete: FaqLog | null = null;

  // Modal de feedback
  showFeedbackModal: boolean = false;
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private faqService: FaqService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async askQuestion() {
    if (!this.question.trim()) {
      return;
    }

    const currentQuestion = this.question.trim();
    this.currentQuestion = currentQuestion; // Salva a pergunta para exibição
    this.isLoading = true;
    this.isStreaming = true;
    this.currentAnswer = '';
    this.question = ''; // Limpa o campo de entrada

    try {
      const streamSub = this.faqService.askQuestionStream(currentQuestion)
        .subscribe({
          next: (chunk: string) => {
            // Para o loading assim que receber o primeiro chunk
            if (this.isLoading) {
              this.isLoading = false;
            }

            // Adiciona o chunk à resposta atual
            this.currentAnswer += chunk;

            // Força a detecção de mudanças para o efeito de digitação
            this.cdr.detectChanges();
          },
          complete: () => {
            this.isLoading = false;
            this.isStreaming = false;
            this.cdr.detectChanges();
            this.loadHistory(); // Atualiza o histórico após receber a resposta
          },
          error: (error: any) => {
            console.error('Erro ao fazer pergunta:', error);
            this.currentAnswer = 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente mais tarde.';
            this.isLoading = false;
            this.isStreaming = false;
            this.cdr.detectChanges();
          }
        });

      this.subscriptions.add(streamSub);
    } catch (error) {
      console.error('Erro ao fazer pergunta:', error);
      this.currentAnswer = 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente mais tarde.';
      this.isLoading = false;
      this.isStreaming = false;
    }
  }



  loadHistory() {
    const historySub = this.faqService.getMyHistory().subscribe({
      next: (response: any) => {
        // Mapear _id para id se necessário (compatibilidade com MongoDB)
        this.history = response.logs.map((log: any) => ({
          ...log,
          id: log.id || log._id  // Usa 'id' se existir, senão usa '_id'
        }));
      },
      error: (error: any) => {
        console.error('Erro ao carregar histórico:', error);
      }
    });

    this.subscriptions.add(historySub);
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.history.length === 0) {
      this.loadHistory();
    }
  }

  selectHistoryQuestion(question: string) {
    this.question = question;
    this.showHistory = false;
  }

  deleteFaqQuestion(logId: string, event: Event) {
    event.stopPropagation(); // Previne que o clique ative o selectHistoryQuestion

    // Encontra o item a ser deletado
    const itemToDelete = this.history.find(item => item.id === logId);
    if (itemToDelete) {
      this.itemToDelete = itemToDelete;
      this.showDeleteModal = true;
    }
  }

  confirmDeleteQuestion() {
    if (!this.itemToDelete) return;

    const logId = this.itemToDelete.id;
    this.showDeleteModal = false;

    const deleteSub = this.faqService.deleteFaqQuestion(logId).subscribe({
      next: (response: any) => {
        console.log('✅ Delete bem-sucedido - Recarregando página...');

        // Recarrega a página completamente (equivalente ao F5)
        window.location.reload();
      },
      error: (error: any) => {
        console.error('Erro ao deletar pergunta:', error);

        // Mostra feedback de erro
        const errorMessage = error?.error?.detail || 'Erro ao deletar pergunta. Tente novamente.';
        this.showFeedbackMessage(errorMessage, 'error');

        this.itemToDelete = null;
      }
    });

    this.subscriptions.add(deleteSub);
  }

  refreshScreen(){
    this.currentQuestion = '';
    this.currentAnswer = '';
    this.isLoading = false;
    this.isStreaming = false;
    this.question = '';
  }

  cancelDeleteQuestion() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  showFeedbackMessage(message: string, type: 'success' | 'error') {
    this.feedbackMessage = message;
    this.feedbackType = type;
    this.showFeedbackModal = true;

    // Auto-close após 3 segundos
    setTimeout(() => {
      this.closeFeedbackModal();
    }, 3000);
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
    this.feedbackMessage = '';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askQuestion();
    }
  }

  trackByFn(index: number, item: FaqLog): string {
    return item.id;
  }
}
