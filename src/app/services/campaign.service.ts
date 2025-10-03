import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Api } from './api';
import { CampaignGenerateResponse, CampaignCreate, Campaign, CampaignListResponse, GameStartResponse, GamePlayRequest, GamePlayResponse } from '../models/campaign';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  constructor(private api: Api) {}

  /**
   * Gera opções de campanha usando IA baseada no personagem selecionado
   * @param userCharacterId ID do personagem do usuário
   * @returns Observable com as 4 opções de campanha geradas
   */
  generateCampaignOptions(userCharacterId: string): Observable<CampaignGenerateResponse> {
    const body = {
      user_character_id: userCharacterId
    };

    console.log('🎯 Iniciando geração de campanhas para personagem:', userCharacterId);

    return this.api.post<CampaignGenerateResponse>('/campaigns/generate-options', body, {
      timeout: 60000 // 60 segundos para operações de IA
    });
  }

  /**
   * Cria uma nova campanha no banco de dados
   * @param campaignData Dados da campanha a ser criada
   * @returns Observable com a campanha criada
   */
  createCampaign(campaignData: CampaignCreate): Observable<Campaign> {

    return this.api.post<Campaign>('/campaigns/', campaignData);
  }

  /**
   * Busca todas as campanhas do usuário autenticado
   * @returns Observable com a lista de campanhas
   */
  getUserCampaigns(): Observable<Campaign[]> {
    return this.api.get<CampaignListResponse>('/campaigns/').pipe(
      map(response => response.campaigns)
    );
  }

  /**
   * Busca uma campanha específica por ID
   * @param campaignId ID da campanha
   * @returns Observable com os dados da campanha
   */
  getCampaignById(campaignId: string): Observable<Campaign> {
    return this.api.get<Campaign>(`/campaigns/${campaignId}`);
  }

  /**
   * Deleta uma campanha específica
   * @param campaignId ID da campanha
   * @returns Observable void
   */
  deleteCampaign(campaignId: string): Observable<void> {
    return this.api.delete<void>(`/campaigns/${campaignId}`);
  }

  /**
   * Inicia uma campanha e retorna o estado inicial do jogo
   * @param campaignId ID da campanha
   * @returns Observable com o estado inicial do jogo
   */
  startGame(campaignId: string): Observable<GameStartResponse> {
    return this.api.get<GameStartResponse>(`/campaigns/${campaignId}/start`);
  }

  /**
   * Resume uma campanha já iniciada e retorna o estado atual do jogo
   * @param campaignId ID da campanha
   * @returns Observable com o estado atual do jogo
   */
  resumeGame(campaignId: string): Observable<GameStartResponse> {
    return this.api.get<GameStartResponse>(`/campaigns/${campaignId}/resume`);
  }

  /**
   * Executa uma ação no jogo e retorna o novo estado
   * @param campaignId ID da campanha
   * @param gamePlayData Dados da ação escolhida
   * @returns Observable com o novo estado do jogo
   */
  playGame(campaignId: string, gamePlayData: GamePlayRequest): Observable<GamePlayResponse> {
    return this.api.post<GamePlayResponse>(`/campaigns/${campaignId}/play`, gamePlayData);
  }

  /**
   * Converte texto em áudio usando TTS do backend
   * @param text Texto para ser convertido em áudio
   * @returns Observable com o blob de áudio
   */
  speakNarration(text: string): Observable<Blob> {
    const body = { text };
    return this.api.postBlob('/narration/speak', body);
  }

  /**
   * Reseta uma campanha para o estado inicial, removendo todo o progresso
   * @param campaignId ID da campanha
   * @returns Observable com a confirmação do reset
   */
  resetCampaign(campaignId: string): Observable<any> {
    return this.api.post(`/campaigns/${campaignId}/reset`, {});
  }
}
