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
          // Se recebemos um novo conversationId, atualizar a conversa atual
          if (response.conversationId && !this.currentConversation) {
            console.log('🆕 Nova conversa criada automaticamente:', response.conversationId);
            this.loadConversations(); // Recarregar lista para incluir nova conversa
          }

          // Para o loading assim que receber o primeiro chunk real
          if (this.isLoading && response.chunk) {
            this.isLoading = false;
          }

          // Adiciona o chunk à resposta atual
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

    // Encontra o item a ser deletado
    const itemToDelete = this.history.find(item => item.id === logId);
    if (itemToDelete) {
      this.itemToDelete = itemToDelete;
      this.showDeleteModal = true;
    }
  }

  confirmDeleteQuestion() {
    // Se estamos deletando uma conversa
    if (this.conversationToDelete) {
      this.confirmDeleteConversation();
      return;
    }

    // Se estamos deletando uma mensagem individual (histórico antigo)
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
    this.conversationToDelete = null;
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

  // Métodos para gerenciar conversações
  loadConversations() {
    const conversationsSub = this.faqService.getConversations().subscribe({
      next: (response: any) => {
        console.log('📊 Resposta das conversações:', response);

        // Mapear _id para id se necessário (compatibilidade com MongoDB)
        this.conversations = (response.conversations || []).map((conv: any) => ({
          ...conv,
          id: conv.id || conv._id  // Usa 'id' se existir, senão usa '_id'
        }));

        console.log('📋 Conversações mapeadas:', this.conversations);
      },
      error: (error: any) => {
        console.error('Erro ao carregar conversações:', error);
      }
    });

    this.subscriptions.add(conversationsSub);
  }

  loadConversationMessages(conversationId: string) {
    console.log('🔍 Carregando mensagens para conversa ID:', conversationId);

    if (!conversationId || conversationId === 'undefined') {
      console.error('❌ ID da conversa inválido:', conversationId);
      return;
    }

    const messagesSub = this.faqService.getConversationDetails(conversationId).subscribe({
      next: (response: ConversationDetails) => {
        console.log('💬 Detalhes da conversa recebidos:', response);

        // Mapear _id para id nas mensagens também
        this.currentMessages = (response.messages || []).map((msg: any) => ({
          ...msg,
          id: msg.id || msg._id
        }));

        // Mapear _id para id na conversa
        this.currentConversation = {
          ...response.conversation,
          id: response.conversation.id || (response.conversation as any)._id
        };

        console.log('📝 Mensagens carregadas:', this.currentMessages.length);
      },
      error: (error: any) => {
        console.error('Erro ao carregar mensagens da conversa:', error);
      }
    });

    this.subscriptions.add(messagesSub);
  }

  selectConversation(conversation: Conversation) {
    console.log('🎯 Selecionando conversa:', conversation);
    console.log('🆔 ID da conversa:', conversation.id);

    this.currentConversation = conversation;
    this.loadConversationMessages(conversation.id);
    this.showConversations = false;
    this.clearCurrentChat();
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
      next: (conversation: any) => {
        console.log('✅ Nova conversa criada:', conversation);

        // Mapear _id para id se necessário
        const mappedConversation = {
          ...conversation,
          id: conversation.id || conversation._id
        };

        console.log('🔄 Conversa mapeada:', mappedConversation);

        this.showNewConversationModal = false;
        this.newConversationTitle = '';
        this.loadConversations();
        this.selectConversation(mappedConversation);
        this.showFeedbackMessage('Nova conversa criada com sucesso!', 'success');
      },
      error: (error: any) => {
        console.error('Erro ao criar conversa:', error);
        this.showFeedbackMessage('Erro ao criar nova conversa. Tente novamente.', 'error');
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
        console.log('✅ Conversa deletada com sucesso - Recarregando página...');

        // Recarrega a página completamente (equivalente ao F5)
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
