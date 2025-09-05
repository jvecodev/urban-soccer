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
}

export interface Player {
  id?: string;
  name: string;
  archetype: PlayerArchetype;
  level: number;
  experience: number;
  userId?: string;
}
