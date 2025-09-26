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
  level: number;
  score: number;
  opponent_score: number;
  time: number;
  currentMission: string;
  inventory: any[];
  availableCards: any[];
  gameContext: string;
}

export interface Campaign {
  id?: string;
  _id?: string; // MongoDB ObjectId
  userId: string;
  userCharacterId: string;
  campaignName: string;
  description: string;
  status: 'not_started' | 'active' | 'completed' | 'paused' | 'abandoned';
  progress: CampaignProgress;
  startDate?: string;
  lastPlayedDate?: string;
  createdAt: string;
  updatedAt: string;
  // Campos adicionais para controle do jogo
  hasGameStarted?: boolean;
  gameState?: GameState;
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
