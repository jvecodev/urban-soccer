import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FaqService, FaqLog, Conversation, ConversationMessage, ConversationDetails } from '../../services/faq.service';
import { Subscription } from 'rxjs';
import { Button } from '../../components/atoms/button/button';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss']
})
export class Faq implements OnInit, OnDestroy {
  question: string = '';
  currentQuestion: string = '';
  currentAnswer: string = '';
  isLoading: boolean = false;
  isStreaming: boolean = false;

  // Sistema de conversações
  conversations: Conversation[] = [];
  currentConversation: Conversation | null = null;
  currentMessages: ConversationMessage[] = [];
  showConversations: boolean = false;

  // Histórico antigo (compatibilidade)
  history: FaqLog[] = [];
  showHistory: boolean = false;

  // Modal de confirmação
  showDeleteModal: boolean = false;
  itemToDelete: FaqLog | null = null;
  conversationToDelete: Conversation | null = null;

  // Modal de feedback
  showFeedbackModal: boolean = false;
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';

  // Modal para criar nova conversa
  showNewConversationModal: boolean = false;
  newConversationTitle: string = '';

  // Modal para editar título da conversa
  showEditTitleModal: boolean = false;
  editingTitle: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private faqService: FaqService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadConversations();
    this.loadHistory(); // Manter para compatibilidade
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
      const streamSub = this.faqService.askQuestionStream(
        currentQuestion,
        this.currentConversation?.id
      ).subscribe({
        next: (response: {chunk: string, conversationId?: string}) => {
          if (response.conversationId && !this.currentConversation) {
            this.loadConversations(); // Recarregar lista para incluir nova conversa
          }

          if (this.isLoading && response.chunk) {
            this.isLoading = false;
          }

          if (response.chunk) {
            this.currentAnswer += response.chunk;
          }

          // Força a detecção de mudanças para o efeito de digitação
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.isStreaming = false;
          this.cdr.detectChanges();

          // Recarregar conversas e mensagens da conversa atual
          this.loadConversations();
          if (this.currentConversation) {
            this.loadConversationMessages(this.currentConversation.id);
          }
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

    const itemToDelete = this.history.find(item => item.id === logId);
    if (itemToDelete) {
      this.itemToDelete = itemToDelete;
      this.showDeleteModal = true;
    }
  }

  confirmDeleteQuestion() {
    if (this.conversationToDelete) {
      this.confirmDeleteConversation();
      return;
    }

    if (!this.itemToDelete) return;

    const logId = this.itemToDelete.id;
    this.showDeleteModal = false;

    const deleteSub = this.faqService.deleteFaqQuestion(logId).subscribe({
      next: (response: any) => {

        window.location.reload();
      },
      error: (error: any) => {
        console.error('Erro ao deletar pergunta:', error);

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
    this.conversationToDelete = null;
  }

  showFeedbackMessage(message: string, type: 'success' | 'error') {
    this.feedbackMessage = message;
    this.feedbackType = type;
    this.showFeedbackModal = true;

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

  loadConversations() {
    const conversationsSub = this.faqService.getConversations().subscribe({
      next: (response: any) => {

        this.conversations = (response.conversations || []).map((conv: any) => ({
          ...conv,
          id: conv.id || conv._id
        }));

      },
      error: (error: any) => {
        console.error('Erro ao carregar conversações:', error);
      }
    });

    this.subscriptions.add(conversationsSub);
  }

  loadConversationMessages(conversationId: string) {

    if (!conversationId || conversationId === 'undefined' || conversationId === 'null') {
      console.error('❌ ID da conversa inválido:', conversationId);
      this.showFeedbackMessage('Erro: ID da conversa inválido.', 'error');
      return;
    }

    const messagesSub = this.faqService.getConversationDetails(conversationId).subscribe({
      next: (response: ConversationDetails) => {

        this.currentMessages = (response.messages || []).map((msg: any) => ({
          ...msg,
          id: msg.id || msg._id
        }));

        this.currentConversation = {
          ...response.conversation,
          id: response.conversation.id || (response.conversation as any)._id
        };


        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao carregar mensagens da conversa:', error);
      }
    });

    this.subscriptions.add(messagesSub);
  }

  selectConversation(conversation: Conversation) {

    if (!conversation.id) {
      console.error('❌ Tentativa de selecionar conversa sem ID válido:', conversation);
      this.showFeedbackMessage('Erro: conversa sem ID válido.', 'error');
      return;
    }

    this.currentConversation = conversation;

    this.currentMessages = [];

    this.showConversations = false;
    this.clearCurrentChat();

    this.cdr.detectChanges();

    this.loadConversationMessages(conversation.id);
  }

  createNewConversation() {
    this.showNewConversationModal = true;
    this.newConversationTitle = '';
  }

  confirmCreateConversation() {
    if (!this.newConversationTitle.trim()) {
      this.showFeedbackMessage('Por favor, insira um título para a conversa.', 'error');
      return;
    }

    const createSub = this.faqService.createConversation(this.newConversationTitle.trim()).subscribe({
      next: (response: any) => {

        const conversationId = response.conversation_id || response.id || response._id;

        if (!conversationId) {
          console.error('❌ Nenhum ID válido retornado pela API:', response);
          this.showFeedbackMessage('Erro: ID da conversa não encontrado.', 'error');
          return;
        }

        const mappedConversation: Conversation = {
          id: conversationId,
          title: this.newConversationTitle.trim(),
          messageCount: 0,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          userId: '' // Será preenchido pelo backend
        };


        this.showNewConversationModal = false;
        this.newConversationTitle = '';

        this.currentConversation = mappedConversation;
        this.currentMessages = [];

        this.showConversations = false;
        this.showHistory = false;

        this.clearCurrentChat();

        this.loadConversations();

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao criar conversa:', error);
        this.showFeedbackMessage('Erro ao criar nova conversa. Tente novamente.', 'error');

        this.showNewConversationModal = false;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(createSub);
  }

  cancelCreateConversation() {
    this.showNewConversationModal = false;
    this.newConversationTitle = '';
  }

  editConversationTitle() {
    if (!this.currentConversation) return;

    this.editingTitle = this.currentConversation.title;
    this.showEditTitleModal = true;
  }

  confirmEditTitle() {
    if (!this.currentConversation || !this.editingTitle.trim()) {
      this.showFeedbackMessage('Por favor, insira um título válido.', 'error');
      return;
    }

    const updateSub = this.faqService.updateConversationTitle(
      this.currentConversation.id,
      this.editingTitle.trim()
    ).subscribe({
      next: (conversation: Conversation) => {
        this.showEditTitleModal = false;
        this.editingTitle = '';
        this.currentConversation = conversation;
        this.loadConversations();
        this.showFeedbackMessage('Título atualizado com sucesso!', 'success');
      },
      error: (error: any) => {
        console.error('Erro ao atualizar título:', error);
        this.showFeedbackMessage('Erro ao atualizar título. Tente novamente.', 'error');
      }
    });

    this.subscriptions.add(updateSub);
  }

  cancelEditTitle() {
    this.showEditTitleModal = false;
    this.editingTitle = '';
  }

  deleteConversation(conversation: Conversation, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.conversationToDelete = conversation;
    this.showDeleteModal = true;
  }

  confirmDeleteConversation() {
    if (!this.conversationToDelete) return;

    const deleteSub = this.faqService.deleteConversation(this.conversationToDelete.id).subscribe({
      next: () => {

        window.location.reload();
      },
      error: (error: any) => {
        console.error('Erro ao deletar conversa:', error);
        this.showFeedbackMessage('Erro ao deletar conversa. Tente novamente.', 'error');
        this.conversationToDelete = null;
        this.showDeleteModal = false;
      }
    });

    this.subscriptions.add(deleteSub);
  }

  toggleConversations() {
    this.showConversations = !this.showConversations;
    if (this.showConversations && this.conversations.length === 0) {
      this.loadConversations();
    }
  }

  clearCurrentChat() {
    this.currentQuestion = '';
    this.currentAnswer = '';
    this.question = '';
    this.isLoading = false;
    this.isStreaming = false;
  }

  selectMessageFromHistory(message: ConversationMessage) {
    this.question = message.question;
  }
}
