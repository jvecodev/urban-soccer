import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../config/environment';

export interface FaqLog {
  id: string;
  question: string;
  answer?: string;
  userId: string;
  conversationId?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  _id?: string; // Para compatibilidade com MongoDB
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationMessage {
  id: string;
  _id?: string; // Para compatibilidade com MongoDB
  question: string;
  answer: string;
  conversationId: string;
  timestamp: string;
}

export interface ConversationDetails {
  conversation: Conversation;
  messages: ConversationMessage[];
}

export interface FaqHistoryResponse {
  logs: FaqLog[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  askQuestionStream(question: string, conversationId?: string): Observable<{chunk: string, conversationId?: string}> {
    const token = localStorage.getItem('auth_token');

    return new Observable(observer => {
      // Validar se o token existe
      if (!token) {
        observer.error(new Error('Token de autenticação não encontrado'));
        return;
      }

      const body: any = { question };
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      // Implementar streaming real
      fetch(`${this.apiUrl}/faq/ask/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        // Capturar conversation_id do header se uma nova conversa foi criada
        const newConversationId = response.headers.get('X-Conversation-ID');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processStream = async () => {
          try {
            // Se há um novo conversation_id, enviar primeiro
            if (newConversationId) {
              observer.next({ chunk: '', conversationId: newConversationId });
            }

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                observer.complete();
                break;
              }

              const chunk = decoder.decode(value, { stream: true });

              if (chunk) {
                observer.next({ chunk, conversationId: newConversationId || undefined });
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error);
            observer.error(error);
          }
        };

        processStream();
      })
      .catch(error => {
        console.error('Fetch error:', error);
        observer.error(error);
      });

      // Cleanup function
      return () => {
        // Cleanup resources if needed
      };
    });
  }

  getMyHistory(): Observable<FaqHistoryResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<FaqHistoryResponse>(`${this.apiUrl}/faq/my-history`, { headers });
  }

  deleteFaqQuestion(logId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/faq/${logId}`, { headers });
  }

  // Métodos para gerenciar conversações
  getConversations(): Observable<ConversationsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<ConversationsResponse>(`${this.apiUrl}/faq/conversations`, { headers });
  }

  createConversation(title: string): Observable<Conversation> {
    const headers = this.getAuthHeaders();
    return this.http.post<Conversation>(`${this.apiUrl}/faq/conversations`, { title }, { headers });
  }

  getConversationDetails(conversationId: string): Observable<ConversationDetails> {
    const headers = this.getAuthHeaders();
    return this.http.get<ConversationDetails>(`${this.apiUrl}/faq/conversations/${conversationId}`, { headers });
  }

  updateConversationTitle(conversationId: string, title: string): Observable<Conversation> {
    const headers = this.getAuthHeaders();
    return this.http.put<Conversation>(`${this.apiUrl}/faq/conversations/${conversationId}`, { title }, { headers });
  }

  deleteConversation(conversationId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/faq/conversations/${conversationId}`, { headers });
  }
}
