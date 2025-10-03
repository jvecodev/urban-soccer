import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Api } from './api';
import { SignupRequest, SignupResponse, LoginRequest, LoginResponse } from '../models/auth.types';
import { User, UserUpdate, UserProfile } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private token = '';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: Api) {
    this.loadUserFromStorage();
  }

  /**
   * Registra um novo usuário
   */
  signup(userData: SignupRequest): Observable<SignupResponse> {
    return this.api.post<SignupResponse>('/users/register', userData)
      .pipe(
        tap((response) => {
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
          this.token = response.access_token;
          this.api.setAuthToken(this.token);
          localStorage.setItem('auth_token', this.token);

          this.getUserProfile().subscribe({
            next: (profile) => {
              const user: User = {
                id: profile._id,
                username: profile.name,
                email: profile.email,
                token: this.token
              };
              this.currentUserSubject.next(user);
              localStorage.setItem('current_user', JSON.stringify(user));
            },
            error: (error) => {
              console.error('Erro ao carregar perfil após login:', error);
              // Se não conseguir carregar o perfil, usa dados básicos
              this.setBasicSession(response, credentials.email);
            }
          });
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
  private clearAllUserData(): void {
    const userDataKeys = [
      'auth_token',
      'current_user',
      'selectedCampaign',
      'selectedPlayer',
      'selectedUserCharacter',
      'playerStats'
    ];

    userDataKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Limpa a sessão do usuário sem fazer logout completo (útil para token expirado)
   */
  private clearUserSession(): void {
    this.token = '';
    this.currentUserSubject.next(null);
    this.api.removeAuthToken();
    this.clearAllUserData();
  }

  logout(): void {
    this.token = '';
    this.currentUserSubject.next(null);
    this.api.removeAuthToken();

    this.clearAllUserData();

  }

  /**
   * Obtém o perfil completo do usuário atual
   */
  getUserProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/users/me')
      .pipe(
        tap((profile) => {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const updatedUser: User = {
              ...currentUser,
              id: profile._id,
              username: profile.name,
              email: profile.email
            };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
          }
        }),
        catchError((error) => {
          console.error('Erro ao obter perfil:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Atualiza dados do usuário
   */
  updateUserProfile(userId: string, updateData: UserUpdate): Observable<UserProfile> {
    return this.api.patch<UserProfile>(`/users/${userId}`, updateData)
      .pipe(
        tap((updatedProfile) => {
          // Atualiza o usuário atual com os novos dados
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const updatedUser: User = {
              ...currentUser,
              id: updatedProfile._id,
              username: updatedProfile.name,
              email: updatedProfile.email
            };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
          }
        }),
        catchError((error) => {
          console.error('Erro ao atualizar perfil:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Deleta a conta do usuário
   */
  deleteUserAccount(userId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}`)
      .pipe(
        tap(() => {
          this.logout();
        }),
        catchError((error) => {
          console.error('Erro ao deletar conta:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const hasToken = !!this.token;
    const tokenNotExpired = !this.isTokenExpired();
    const isAuth = hasToken && tokenNotExpired;

    if (hasToken && !tokenNotExpired && this.currentUserSubject.value) {
      this.clearUserSession();
    }

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

    const user: User = {
      id: authResponse.user?.id?.toString() ?? Date.now().toString(),
      username: authResponse.user?.username ?? email.split('@')[0],
      email: email,
      token: this.token
    };

    this.currentUserSubject.next(user);
    this.api.setAuthToken(this.token);

    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Define sessão básica quando não consegue carregar perfil completo
   */
  private setBasicSession(authResponse: LoginResponse, email: string): void {
    const user: User = {
      id: authResponse.user?.id?.toString() ?? Date.now().toString(),
      username: authResponse.user?.username ?? email.split('@')[0],
      email: email,
      token: this.token
    };

    this.currentUserSubject.next(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');



    if (token && userJson) {
      try {
        this.token = token;
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.api.setAuthToken(token);


        // Removi a chamada automática para /users/me que estava causando erro 401
        // A atualização do perfil pode ser feita manualmente quando necessário

      } catch (error) {
        console.error('❌ Erro ao carregar usuário do localStorage:', error);
        // Chama logout para limpar todos os dados corrompidos
        this.logout();
      }
    } else {
    }
  }

  /**
   * Método público para verificar o status atual da autenticação
   */
  public getAuthStatus(): { hasToken: boolean; isValid: boolean; token?: string } {
    const token = localStorage.getItem('auth_token');
    const hasToken = !!token;
    const isValid = hasToken && !this.isTokenExpired();

    console.log('🔍 Status da autenticação:', {
      hasToken,
      isValid,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });

    return {
      hasToken,
      isValid,
      token: token || undefined
    };
  }

  /**
   * Verifica se o token está expirado
   * Implementação básica - você pode melhorar decodificando o JWT
   */
  private isTokenExpired(): boolean {
    if (!this.token) {
      return true;
    }

    try {
      // Implementação real para JWT
      if (this.token.includes('.')) {
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime;


        return isExpired;
      } else {
        // Se não é um JWT válido, considerar válido por 1 hora
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      return true;
    }
  }
}
