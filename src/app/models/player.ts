// Modelos para a API do backend
export interface PlayerStats {
  speed: number;
  attack: number;
  defense: number;
  leadership: number;
  specialAbility: string;
}

export interface ApiPlayer {
  _id: string;
  name: string;
  description: string;
  rarity: 'default' | 'unique';
  stats: PlayerStats;
  imageUrl: string;
  modelUrl: string;
  isAvailable: boolean;
}

export interface PlayerListResponse {
  players: ApiPlayer[];
}

// Modelos para o frontend (mantidos para compatibilidade)
export interface PlayerAttributes {
  speed: number;
  shooting: number;
  passing: number;
  defense: number;
  leadership: number;
}

export interface PlayerArchetype {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  attributes: PlayerAttributes;
  primaryColor: string;
  secondaryColor: string;
  rarity?: 'default' | 'unique';
  stats?: PlayerStats;
}

export interface Player {
  id?: string;
  name: string;
  archetype: PlayerArchetype;
  level: number;
  experience: number;
  userId?: string;
}
