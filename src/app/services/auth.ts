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
    return this.api.post<LoginResponse>('/users/login', credentials)
      .pipe(
        tap((response) => {
          console.log('Login response:', response);
          this.setSession(response, credentials.email);
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
    const hasToken = !!this.token;
    const tokenNotExpired = !this.isTokenExpired();
    const isAuth = hasToken && tokenNotExpired;

    console.log('Verificando autenticação:', {
      hasToken,
      tokenNotExpired,
      isAuthenticated: isAuth,
      currentUser: this.currentUserSubject.value
    });

    return isAuth;
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
  private setSession(authResponse: LoginResponse, email: string): void {
    this.token = authResponse.access_token;

    // Como a API não retorna dados do usuário, criamos um objeto básico
    const user: User = {
      id: Date.now(), // ID temporário
      username: email.split('@')[0], // Usar parte antes do @ como username
      email: email,
      token: authResponse.access_token
    };

    this.currentUserSubject.next(user);
    this.api.setAuthToken(this.token);

    // Salva no localStorage
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('current_user', JSON.stringify(user));

    console.log('Sessão configurada:', { token: !!this.token, user });
  }

  /**
   * Carrega dados do usuário do localStorage
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');

    console.log('Carregando dados do localStorage...', { token: !!token, userJson: !!userJson });

    if (token && userJson) {
      try {
        this.token = token;
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.api.setAuthToken(token);
        console.log('Usuário carregado do localStorage:', user);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        this.logout();
      }
    } else {
      console.log('Nenhum token ou usuário encontrado no localStorage');
    }
  }

  /**
   * Verifica se o token está expirado
   * Implementação básica - você pode melhorar decodificando o JWT
   */
  private isTokenExpired(): boolean {
    if (!this.token) {
      console.log('Token não existe');
      return true;
    }

    try {
      // Para fins de teste, considerar token sempre válido
      // Em produção, você pode decodificar o JWT real
      console.log('Token considerado válido para teste');
      return false;

      /* Implementação real para JWT:
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
      */
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return true;
    }
  }
}
