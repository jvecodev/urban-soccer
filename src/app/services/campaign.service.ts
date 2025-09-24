import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { CampaignGenerateResponse, CampaignCreate, Campaign } from '../models/campaign';

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


    return this.api.post<CampaignGenerateResponse>('/campaigns/generate-options', body);
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
    return this.api.get<Campaign[]>('/campaigns/user');
  }

  /**
   * Busca uma campanha específica por ID
   * @param campaignId ID da campanha
   * @returns Observable com os dados da campanha
   */
  getCampaignById(campaignId: string): Observable<Campaign> {
    return this.api.get<Campaign>(`/campaigns/${campaignId}`);
  }
}
