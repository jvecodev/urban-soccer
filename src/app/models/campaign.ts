export interface CampaignOption {
  campaignName: string;
  description: string;
}

export interface CampaignGenerateResponse {
  options: CampaignOption[];
}

export interface CampaignCreate {
  playerId: string;
  campaignName: string;
  description: string;
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
