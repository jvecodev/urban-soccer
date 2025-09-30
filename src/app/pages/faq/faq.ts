import { Component, OnInit, OnDestroy } from '@angular/core';
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
  currentAnswer: string = '';
  isLoading: boolean = false;
  isStreaming: boolean = false;
  history: FaqLog[] = [];
  showHistory: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private faqService: FaqService,
    private router: Router
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
    this.isLoading = true;
    this.isStreaming = true;
    this.currentAnswer = '';
    this.question = ''; // Limpa o campo de entrada

    try {
      const streamSub = this.faqService.askQuestionStream(currentQuestion)
        .subscribe({
          next: (chunk: string) => {
            this.currentAnswer += chunk;
          },
          complete: () => {
            this.isLoading = false;
            this.isStreaming = false;
            this.loadHistory(); // Atualiza o histórico após receber a resposta
          },
          error: (error: any) => {
            console.error('Erro ao fazer pergunta:', error);
            this.currentAnswer = 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.';
            this.isLoading = false;
            this.isStreaming = false;
          }
        });

      this.subscriptions.add(streamSub);
    } catch (error) {
      console.error('Erro ao fazer pergunta:', error);
      this.currentAnswer = 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.';
      this.isLoading = false;
      this.isStreaming = false;
    }
  }

  clearChat() {
    this.question = '';
    this.currentAnswer = '';
  }

  loadHistory() {
    const historySub = this.faqService.getMyHistory().subscribe({
      next: (response: any) => {
        this.history = response.logs;
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

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askQuestion();
    }
  }
}
