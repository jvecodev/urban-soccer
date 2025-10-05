import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { CampaignService } from '../../services/campaign.service';
import { CampaignOption, CampaignCreate, Campaign } from '../../models/campaign';
import { UserCharacter } from '../../models/userCharacter';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-campaign-selection',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './campaign-selection.html',
  styleUrls: ['./campaign-selection.scss'],
  providers: [MessageService],
})

/**
 * @class CampaignSelection
 * @description Componente que permite ao usuário selecionar ou gerar uma nova campanha para seu personagem
 * @implements OnInit
 * @property {Signal<boolean>} isLoading - Indica se os dados estão sendo carregados
 * @property {Signal<boolean>} isCreatingCampaign - Indica se uma campanha está sendo criada
 * @property {Signal<CampaignOption[]>} campaignOptions - Opções de campanha geradas para o personagem
 * @property {Signal<UserCharacter | null>} selectedUserCharacter - Personagem do usuário selecionado
 * @property {Signal<any | null>} selectedPlayer - Jogador associado ao personagem selecionado
 * @method ngOnInit - Inicializa o componente, verifica autenticação e carrega dados do personagem e opções de campanha
 * @method loadCharacterData - Carrega os dados do personagem selecionado do localStorage
 * @method generateCampaignOptions - Gera opções de campanha chamando a API com o ID do personagem
 * @method selectCampaign - Seleciona uma opção de campanha e cria a campanha chamando a API
 * @method goToMyCampaigns - Navega para a página de "Minhas Campanhas"
 * @method refreshOptions - Recarrega as opções de campanha
 * @method getCharacterName - Retorna o nome do personagem selecionado
 * @method getCharacterArchetype - Retorna o arquétipo do personagem selecionado
 * @method getCharacterImage - Retorna a imagem do arquétipo do personagem selecionado
 *
 */

export class CampaignSelection implements OnInit {
  isLoading = signal(true);
  isCreatingCampaign = signal(false);
  campaignOptions = signal<CampaignOption[]>([]);
  selectedUserCharacter = signal<UserCharacter | null>(null);
  selectedPlayer = signal<any>(null);

  constructor(
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private campaignService: CampaignService,
    private auth: Auth
  ) {}

  ngOnInit() {


    if (!this.auth.isAuthenticated()) {
      console.error('❌ Usuário não autenticado, redirecionando para login');
      this.messageService.add({
        severity: 'error',
        summary: 'Sessão Expirada',
        detail: 'Sua sessão expirou. Faça login novamente.',
      });
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }


    this.loadCharacterData();

    setTimeout(() => {
      this.generateCampaignOptions();
    }, 100);
  }



  private loadCharacterData() {

    const selectedUserCharacterData = localStorage.getItem('selectedUserCharacter');
    const selectedPlayerData = localStorage.getItem('selectedPlayer');

    if (!selectedUserCharacterData || !selectedPlayerData) {
      console.error('❌ Dados do personagem não encontrados no localStorage');
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nenhum personagem foi selecionado. Redirecionando...',
      });
      setTimeout(() => {
        this.router.navigate(['/my-characters']);
      }, 2000);
      return;
    }

    try {
      const userCharacter = JSON.parse(selectedUserCharacterData);
      const player = JSON.parse(selectedPlayerData);

      this.selectedUserCharacter.set(userCharacter);
      this.selectedPlayer.set(player);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do personagem:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar dados do personagem.',
      });
      this.router.navigate(['/my-characters']);
    }
  }

  private generateCampaignOptions() {
    const userCharacter = this.selectedUserCharacter();

    if (!userCharacter || !userCharacter._id) {
      console.error('❌ ID do personagem não encontrado');
      this.isLoading.set(false);
      return;
    }

    const authStatus = this.auth.getAuthStatus();

    if (!authStatus.isValid) {
      console.error('❌ Token inválido ou expirado, redirecionando para login');
      this.messageService.add({
        severity: 'error',
        summary: 'Sessão Expirada',
        detail: 'Sua sessão expirou. Faça login novamente.',
      });
      this.auth.logout();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      this.isLoading.set(false);
      return;
    }

    this.campaignService.generateCampaignOptions(userCharacter._id).subscribe({
      next: (response) => {
        this.campaignOptions.set(response.options);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao gerar opções de campanha:', error);
        console.error('❌ Status do erro:', error.status);
        console.error('❌ Detalhes do erro:', error.error);
        console.error('❌ Mensagem do erro:', error.message);
        this.isLoading.set(false);

        let errorMessage = 'Erro ao gerar opções de campanha.';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          if (error.status === 401 || error.message?.includes('Não autorizado') || error.message?.includes('Token expirado')) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
            this.auth.logout();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 403 || error.message?.includes('Acesso negado')) {
            errorMessage = 'Acesso negado. Faça login novamente.';
            this.auth.logout();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 0 || error.message?.includes('conectividade')) {
            errorMessage = 'Problema de conectividade. Verifique se a API está rodando.';
          } else if (error.error?.detail) {
            errorMessage = error.error.detail;
          } else if (error.message) {
            errorMessage = error.message;
          }
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
        });
      },
    });
  }

  selectCampaign(option: CampaignOption) {
    const userCharacter = this.selectedUserCharacter();
    const player = this.selectedPlayer();

    if (!userCharacter || !player || !userCharacter._id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Dados do personagem não encontrados.',
      });
      return;
    }

    this.isCreatingCampaign.set(true);

    const campaignData: CampaignCreate = {
      userCharacterId: userCharacter._id,
      campaignName: option.campaignName,
      description: option.description,
    };


    this.campaignService.createCampaign(campaignData).subscribe({
      next: (createdCampaign: Campaign) => {

        localStorage.setItem('selectedCampaign', JSON.stringify(createdCampaign));

        this.messageService.add({
          severity: 'success',
          summary: 'Campanha Criada!',
          detail: `${option.campaignName} foi iniciada com sucesso!`,
        });

        this.isCreatingCampaign.set(false);

        setTimeout(() => {
          this.router.navigate(['/game-start']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erro ao criar campanha:', error);
        this.isCreatingCampaign.set(false);

        let errorMessage = 'Erro ao criar campanha.';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          if (error.status === 400) {
            errorMessage = 'Dados inválidos para criação da campanha.';
          } else if (error.status === 401 || error.message?.includes('Não autorizado')) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
            this.auth.logout();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 403 || error.message?.includes('Acesso negado')) {
            errorMessage = 'Acesso negado. Faça login novamente.';
            this.auth.logout();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 0 || error.message?.includes('conectividade')) {
            errorMessage = 'Problema de conectividade. Verifique se a API está rodando.';
          } else if (error.error?.detail) {
            errorMessage = error.error.detail;
          } else if (error.message) {
            errorMessage = error.message;
          }
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
        });
      },
    });
  }

  goToMyCampaigns(): void {
    this.router.navigate(['/my-campaigns']);
  }

  refreshOptions() {
    this.isLoading.set(true);
    this.campaignOptions.set([]);
    this.generateCampaignOptions();
  }

  getCharacterName(): string {
    const userCharacter = this.selectedUserCharacter();
    return userCharacter?.characterName || 'Personagem';
  }

  getCharacterArchetype(): string {
    const player = this.selectedPlayer();
    return player?.archetype?.name || 'Desconhecido';
  }

  getCharacterImage(): string {
    const player = this.selectedPlayer();
    return player?.archetype?.image || '';
  }
}
