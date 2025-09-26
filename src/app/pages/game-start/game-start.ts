import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
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
    TooltipModule,
  ],
  templateUrl: './game-start.html',
  styleUrls: ['./game-start.scss'],
  providers: [MessageService],
})
export class GameStart implements OnInit, OnDestroy {
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
  isSpeaking = signal(false);
  audioElement: HTMLAudioElement | null = null;

  constructor(
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private campaignService: CampaignService,
    private auth: Auth
  ) {}

  ngOnDestroy() {
    this.stopNarration();
  }

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


    this.campaignService.startGame(campaignId).subscribe({
      next: (gameData: GameStartResponse) => {

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


    this.isPlayingAction.set(true);

    this.campaignService.playGame(campaignId, { actionId: actionCard.actionId }).subscribe({
      next: (response: GamePlayResponse) => {

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
    if (this.isSpeaking()) {
      this.stopNarration();
    }

    this.isSpeaking.set(true);

    // Primeiro tenta usar o TTS do backend
    this.speakWithBackend(text).catch(() => {
      this.speakWithBrowser(text);
    });
  }

  private async speakWithBackend(text: string): Promise<void> {
    try {
      const response = await this.campaignService.speakNarration(text).toPromise();

      if (response && response instanceof Blob) {
        const audioUrl = URL.createObjectURL(response);
        this.audioElement = new Audio(audioUrl);

        this.audioElement.onloadeddata = () => {
        };

        this.audioElement.onended = () => {
          this.isSpeaking.set(false);
          if (this.audioElement) {
            URL.revokeObjectURL(this.audioElement.src);
            this.audioElement = null;
          }
        };

        this.audioElement.onerror = () => {
          console.error('❌ Erro ao reproduzir áudio do backend');
          this.isSpeaking.set(false);
          this.speakWithBrowser(text);
        };

        await this.audioElement.play();
      } else {
        throw new Error('Resposta inválida do backend');
      }
    } catch (error) {
      console.error('❌ Erro no TTS do backend:', error);
      throw error;
    }
  }

  private speakWithBrowser(text: string) {
    if ('speechSynthesis' in window) {
      // Para a fala anterior se estiver ativa
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
      };

      utterance.onend = () => {
        this.isSpeaking.set(false);
      };

      utterance.onerror = (event) => {
        console.error('❌ Erro na narração do navegador:', event);
        this.isSpeaking.set(false);
      };

      speechSynthesis.speak(utterance);
    } else {
      console.warn('⚠️ Text-to-Speech não disponível');
      this.isSpeaking.set(false);
    }
  }

  stopNarration() {

    // Para áudio do backend
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      URL.revokeObjectURL(this.audioElement.src);
      this.audioElement = null;
    }

    // Para TTS do navegador
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    this.isSpeaking.set(false);
  }

  toggleNarration() {
    if (this.isSpeaking()) {
      this.stopNarration();
    } else {
      const currentText = this.currentNarration();
      if (currentText) {
        this.speakNarration(currentText);
      }
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
