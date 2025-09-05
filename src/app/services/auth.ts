import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Api } from './api';
import { SignupRequest, SignupResponse, LoginRequest, LoginResponse } from '../models/auth.types';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private token = '';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: Api) {
    // Carrega token e usuário do localStorage se existirem
    this.loadUserFromStorage();
  }

  /**
   * Registra um novo usuário
   */
  signup(userData: SignupRequest): Observable<SignupResponse> {
    return this.api.post<SignupResponse>('/users/register', userData)
      .pipe(
        tap((response) => {
          console.log('Usuário registrado com sucesso:', response);
        }),
        catchError((error) => {
          console.error('Erro no registro:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Faz login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap((response) => {
          this.setSession(response);
        }),
        catchError((error) => {
          console.error('Erro no login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Faz logout do usuário
   */
  logout(): void {
    this.token = '';
    this.currentUserSubject.next(null);
    this.api.removeAuthToken();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  /**
   * Obtém o token atual
   */
  getToken(): string {
    return this.token;
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Define a sessão do usuário após login bem-sucedido
   */
  private setSession(authResponse: LoginResponse): void {
    this.token = authResponse.access_token;

    const user: User = {
      id: authResponse.user._id,
      username: authResponse.user.username,
      email: authResponse.user.email,
      token: authResponse.access_token
    };

    this.currentUserSubject.next(user);
    this.api.setAuthToken(this.token);

    // Salva no localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Carrega dados do usuário do localStorage
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');

    if (token && userJson && !this.isTokenExpired()) {
      this.token = token;
      const user = JSON.parse(userJson);
      this.currentUserSubject.next(user);
      this.api.setAuthToken(token);
    } else {
      // Remove dados inválidos
      this.logout();
    }
  }

  /**
   * Verifica se o token está expirado
   * Implementação básica - você pode melhorar decodificando o JWT
   */
  private isTokenExpired(): boolean {
    if (!this.token) return true;

    try {
      // Decodifica o JWT para verificar expiração
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}
