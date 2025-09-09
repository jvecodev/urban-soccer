// Importa o modelo Player para usar na referência
import { ApiPlayer } from './player';

export interface UserCharacter {
  _id?: string;
  userId: string;
  playerId: string;
  characterName: string;
  createdAt?: string;
  updatedAt?: string;
  player?: ApiPlayer; // Dados completos do player quando retornado pelo backend
}

export interface UserCharacterCreate {
  playerId: string;
  characterName: string;
}

export interface UserCharacterUpdate {
  characterName?: string;
}

export interface UserCharacterPublic {
  _id: string;
  userId: string;
  playerId: string;
  characterName: string;
  createdAt: string;
  updatedAt?: string;
  player?: ApiPlayer; // Dados completos do player quando retornado pelo backend
}

export interface UserCharacterList {
  characters: UserCharacterPublic[];
}
