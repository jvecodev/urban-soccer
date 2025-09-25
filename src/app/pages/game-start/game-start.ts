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
import { Campaign, GameStartResponse, GamePlayResponse, ActionCard, GameState } from '../../models/campaign';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-game-start',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './game-start.html',
  styleUrls: ['./game-start.scss'],
  providers: [MessageService],
})
export class GameStart implements OnInit {
  isLoading = signal(true);
  isPlayingAction = signal(false);
  selectedCampaign = signal<Campaign | null>(null);
  currentNarration = signal<string>('');
  availableCards = signal<ActionCard[]>([]);
  gameState = signal<GameState | null>(null);
  isGameOver = signal(false);
  gameResult = signal<'win' | 'lose' | 'draw' | null>(null);
  narrationHistory = signal<string[]>([]);
  showHistory = false;

  constructor(
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private campaignService: CampaignService,
    private auth: Auth
  ) {}

  ngOnInit() {
    // Verifica se o usuário está autenticado
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

    this.loadSelectedCampaign();
  }

  private loadSelectedCampaign() {
    // Carrega campanha selecionada do localStorage
    const selectedCampaignData = localStorage.getItem('selectedCampaign');

    if (!selectedCampaignData) {
      console.error('❌ Nenhuma campanha selecionada');
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nenhuma campanha foi selecionada. Redirecionando...',
      });
      setTimeout(() => {
        this.router.navigate(['/my-campaigns']);
      }, 2000);
      return;
    }

    try {
      const campaign = JSON.parse(selectedCampaignData);
      this.selectedCampaign.set(campaign);
      console.log('✅ Campanha carregada:', campaign);
      console.log('🔍 ID da campanha:', campaign.id || campaign._id);
      console.log('🔍 Chaves do objeto campanha:', Object.keys(campaign));

      // Inicia o jogo
      this.startGame();
    } catch (error) {
      console.error('❌ Erro ao carregar campanha:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar dados da campanha.',
      });
      this.router.navigate(['/my-campaigns']);
    }
  }

  private startGame() {
    const campaign = this.selectedCampaign();
    if (!campaign) return;

    // Tenta usar id ou _id (compatibilidade com MongoDB)
    const campaignId = campaign.id || (campaign as any)._id;

    if (!campaignId) {
      console.error('❌ ID da campanha não encontrado:', campaign);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID da campanha não encontrado.',
      });
      this.isLoading.set(false);
      return;
    }

    console.log('🎮 Iniciando jogo para campanha:', campaignId);

    this.campaignService.startGame(campaignId).subscribe({
      next: (gameData: GameStartResponse) => {
        console.log('✅ Jogo iniciado com sucesso:', gameData);

        this.currentNarration.set(gameData.narration);
        this.availableCards.set(gameData.availableCards);
        this.gameState.set(gameData.gameState);
        this.narrationHistory.set([gameData.narration]);
        this.isLoading.set(false);

        // Lê a narração em voz alta
        this.speakNarration(gameData.narration);
      },
      error: (error) => {
        console.error('❌ Erro ao iniciar jogo:', error);
        this.isLoading.set(false);

        let errorMessage = 'Erro ao iniciar o jogo.';

        if (error.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          this.auth.logout();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 404) {
          errorMessage = 'Campanha não encontrada.';
        } else if (error.status === 0) {
          errorMessage = 'Problema de conectividade. Verifique se a API está rodando.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
        });
      },
    });
  }

  playAction(actionCard: ActionCard) {
    const campaign = this.selectedCampaign();
    if (!campaign || this.isPlayingAction() || this.isGameOver()) return;

    // Tenta usar id ou _id (compatibilidade com MongoDB)
    const campaignId = campaign.id || (campaign as any)._id;

    if (!campaignId) {
      console.error('❌ ID da campanha não encontrado:', campaign);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID da campanha não encontrado.',
      });
      return;
    }

    console.log('🎯 Executando ação:', actionCard);

    this.isPlayingAction.set(true);

    this.campaignService.playGame(campaignId, { actionId: actionCard.actionId }).subscribe({
      next: (response: GamePlayResponse) => {
        console.log('✅ Resposta da ação:', response);

        // Atualiza o estado do jogo
        this.currentNarration.set(response.narration);
        this.availableCards.set(response.availableCards);
        this.gameState.set(response.gameState);

        // Adiciona narração ao histórico
        const history = this.narrationHistory();
        history.push(response.narration);
        this.narrationHistory.set([...history]);

        // Verifica se o jogo acabou
        if (response.isGameOver) {
          this.isGameOver.set(true);
          this.gameResult.set(response.result || null);
          console.log('🏁 Jogo finalizado com resultado:', response.result);
        }

        this.isPlayingAction.set(false);

        // Lê a narração em voz alta
        this.speakNarration(response.narration);
      },
      error: (error) => {
        console.error('❌ Erro ao executar ação:', error);
        this.isPlayingAction.set(false);

        let errorMessage = 'Erro ao executar ação.';

        if (error.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          this.auth.logout();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 400) {
          errorMessage = 'Ação inválida.';
        } else if (error.status === 0) {
          errorMessage = 'Problema de conectividade. Verifique se a API está rodando.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
        });
      },
    });
  }

  private speakNarration(text: string) {
    // Implementa text-to-speech se disponível
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }

  goBack(): void {
    this.location.back();
  }

  backToCampaigns(): void {
    this.router.navigate(['/my-campaigns']);
  }

  getCampaignName(): string {
    const campaign = this.selectedCampaign();
    return campaign?.campaignName || 'Campanha';
  }

  getActionIcon(actionId: string): string {
    // Mapeamento de ícones para diferentes tipos de ação
    const iconMap: { [key: string]: string } = {
      'tocar_curto': 'pi pi-send',
      'drible_rapido': 'pi pi-forward',
      'chutar_area': 'pi pi-circle',
      'passe_longo': 'pi pi-arrow-up-right',
      'defesa': 'pi pi-shield',
      'correr': 'pi pi-play',
      'default': 'pi pi-star'
    };

    return iconMap[actionId] || iconMap['default'];
  }

  getResultSeverity(): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    const result = this.gameResult();
    switch (result) {
      case 'win':
        return 'success';
      case 'lose':
        return 'danger';
      case 'draw':
        return 'warning';
      default:
        return 'info';
    }
  }

  getResultLabel(): string {
    const result = this.gameResult();
    switch (result) {
      case 'win':
        return 'Vitória!';
      case 'lose':
        return 'Derrota';
      case 'draw':
        return 'Empate';
      default:
        return 'Jogo Finalizado';
    }
  }
}
