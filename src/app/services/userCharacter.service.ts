import { Injectable } from '@angular/core';
import { Observable, map, throwError, catchError, EMPTY } from 'rxjs';
import { Api } from './api';
import { Auth } from './auth';
import {
  UserCharacter,
  UserCharacterCreate,
  UserCharacterUpdate,
  UserCharacterPublic,
  UserCharacterList
} from '../models/userCharacter';

@Injectable({
  providedIn: 'root'
})
export class UserCharacterService {

  constructor(
    private api: Api,
    private auth: Auth
  ) {}

  private setupAuthToken(): void {
    // Primeiro tenta pegar da memória
    let token = this.auth.getToken();

    // Se não encontrar na memória, tenta pegar do localStorage
    if (!token) {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        token = storedToken;
      }
    }

    if (token) {
      this.api.setAuthToken(token);
    } else {
      console.warn('⚠️ Token não encontrado para configurar API');
    }
  }

  /**
   * Cria um novo personagem do usuário
   */
  createUserCharacter(characterData: UserCharacterCreate): Observable<UserCharacterPublic> {
    this.setupAuthToken();

    return this.api.post<UserCharacterPublic>('/characters/', characterData);
  }

  /**
   * Busca todos os personagens do usuário atual
   */
  getUserCharacters(): Observable<UserCharacterPublic[]> {
    this.setupAuthToken();

    return this.api.get<UserCharacterList>('/characters/')
      .pipe(
        map(response => {
          return response.characters || [];
        })
      );
  }

  /**
   * Busca um personagem específico por ID
   */
  getUserCharacterById(characterId: string): Observable<UserCharacterPublic> {
    this.setupAuthToken();

    return this.api.get<UserCharacterPublic>(`/characters/${characterId}`);
  }

  /**
   * Atualiza um personagem do usuário
   */
  updateUserCharacter(characterId: string, updateData: UserCharacterUpdate): Observable<UserCharacterPublic> {
    this.setupAuthToken();

    return this.api.patch<UserCharacterPublic>(`/characters/${characterId}`, updateData);
  }

  /**
   * Deleta um personagem do usuário
   */
  deleteUserCharacter(characterId: string): Observable<void> {
    this.setupAuthToken();

    return this.api.delete<void>(`/characters/${characterId}`);
  }
}
