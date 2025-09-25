export interface CampaignOption {
  campaignName: string;
  description: string;
}

export interface CampaignGenerateResponse {
  options: CampaignOption[];
}

export interface CampaignCreate {
  userCharacterId: string;
  campaignName: string;
  description: string;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
}

export interface CampaignProgress {
  currentLevel: number;
  totalLevels: number;
  experience: number;
  achievements: string[];
}

export interface Campaign {
  id: string;
  userId: string;
  playerId: string;
  campaignName: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  progress: CampaignProgress;
  startDate: string;
  lastPlayedDate: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignPublic = Campaign;

// Interfaces para o gameplay
export interface ActionCard {
  actionId: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface GameState {
  score: string;
  time: number;
  playerPosition?: string;
  ballPosition?: string;
  [key: string]: any;
}

export interface GameStartResponse {
  narration: string;
  availableCards: ActionCard[];
  gameState: GameState;
}

export interface GamePlayRequest {
  actionId: string;
}

export interface GamePlayResponse {
  narration: string;
  availableCards: ActionCard[];
  gameState: GameState;
  isGameOver?: boolean;
  result?: 'win' | 'lose' | 'draw';
}
