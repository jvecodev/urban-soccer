import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../config/environment';

export interface FaqLog {
  id: string;
  question: string;
  userId: string;
  timestamp: string;
}

export interface FaqHistoryResponse {
  logs: FaqLog[];
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

  askQuestionStream(question: string): Observable<string> {
    const token = localStorage.getItem('auth_token');

    return new Observable(observer => {
      // Validar se o token existe
      if (!token) {
        observer.error(new Error('Token de autenticação não encontrado'));
        return;
      }



      // Implementar streaming real
      fetch(`${this.apiUrl}/faq/ask/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      })
      .then(response => {


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                observer.complete();
                break;
              }

              const chunk = decoder.decode(value, { stream: true });

              if (chunk) {
                observer.next(chunk);
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
}
