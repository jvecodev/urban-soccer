import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, timeout, retry } from 'rxjs';
import { environment } from '../config/environment';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly baseUrl = environment.apiUrl;

  private defaultHeaders: { [key: string]: string } = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  constructor(private http: HttpClient) {}

  /**
   * Realiza uma requisição POST
   */
  post<T>(endpoint: string, data: any, options?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new HttpHeaders({
      ...this.defaultHeaders,
      ...options?.headers
    });

    // Debug de requisições importantes
    if (endpoint.includes('campaign')) {

    }

    return this.http.post<T>(url, data, { headers })
      .pipe(
        timeout(environment.apiTimeout || 10000),
        catchError(this.handleError)
      );
  }

  /**
   * Realiza uma requisição GET
   */
  get<T>(endpoint: string, options?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new HttpHeaders({
      ...this.defaultHeaders,
      ...options?.headers
    });

    return this.http.get<T>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realiza uma requisição PUT
   */
  put<T>(endpoint: string, data: any, options?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new HttpHeaders({
      ...this.defaultHeaders,
      ...options?.headers
    });

    return this.http.put<T>(url, data, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realiza uma requisição PATCH
   */
  patch<T>(endpoint: string, data: any, options?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new HttpHeaders({
      ...this.defaultHeaders,
      ...options?.headers
    });

    return this.http.patch<T>(url, data, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realiza uma requisição DELETE
   */
  delete<T>(endpoint: string, options?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new HttpHeaders({
      ...this.defaultHeaders,
      ...options?.headers
    });

    return this.http.delete<T>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realiza uma requisição POST para retornar blob (áudio, imagem, etc)
   */
  postBlob(endpoint: string, data: any, options?: any): Observable<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...options?.headers
    });

    return this.http.post(url, data, {
      headers,
      responseType: 'blob'
    }).pipe(
      timeout(environment.apiTimeout || 10000),
      catchError(this.handleError)
    );
  }

  /**
   * Adiciona token de autenticação aos headers
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove token de autenticação dos headers
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Testa a conectividade com a API
   */
  testConnection(): Observable<any> {
    const url = `${this.baseUrl}/health`; // ou qualquer endpoint simples

    return this.http.get(url)
      .pipe(
        timeout(5000),
        catchError((error) => {
          console.error('❌ Falha no teste de conectividade:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Manipula erros das requisições HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          if (error.error instanceof ProgressEvent) {
            errorMessage = 'CORS: Usuário pode ter sido criado com sucesso.';
          } else {
            errorMessage = 'Problema de conectividade. Verifique se a API está rodando.';
          }
          break;
        case 201:
          // 201 é sucesso para criação, não deveria ser erro
          errorMessage = 'Usuário criado com sucesso';
          break;
        case 422:
          if (error.error?.detail && Array.isArray(error.error.detail)) {
            const validationErrors = error.error.detail.map((err: any) => {
              if (err.loc && err.msg) {
                const field = err.loc[err.loc.length - 1];
                return `${field}: ${err.msg}`;
              }
              return err.msg || 'Erro de validação';
            });
            errorMessage = validationErrors.join(', ');
          } else {
            errorMessage = 'Dados inválidos enviados para a API.';
          }
          break;
        case 500:
          errorMessage = 'Usuário pode ter sido criado com sucesso.';
          break;
        case 404:
          errorMessage = 'Endpoint não encontrado. Verifique a URL da API.';
          break;
        case 400:
          errorMessage = error.error?.detail || 'Dados inválidos enviados para a API.';
          break;
        default:
          errorMessage = error.error?.detail || error.error?.message || `Erro ${error.status}: ${error.statusText}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
