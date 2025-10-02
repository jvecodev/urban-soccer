import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { MessageService } from 'primeng/api';

import { CampaignService } from '../../services/campaign.service';
import { Campaign, GameStartResponse, GamePlayResponse, ActionCard, GameState } from '../../models/campaign';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-game-start',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    DialogModule,
    SliderModule,
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

  // Controle de seleção de card
  selectedCard = signal<ActionCard | null>(null);
  showCardConfirmation = signal(false);

  // Modal de pausa da campanha
  showPauseModal = signal(false);

  campaignToReview = signal<Campaign | null>(null);

  // Controle de volume da narração
  narrationVolume = signal(80);
  isPaused = signal(false);

  // Controle de permissão de áudio
  audioPermissionGranted = signal(false);
  autoPlayEnabled = signal(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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

    const action = this.route.snapshot.queryParams['action'] || 'start';

    const gameObservable = action === 'resume'
      ? this.campaignService.resumeGame(campaignId)
      : this.campaignService.startGame(campaignId);


    gameObservable.subscribe({
      next: (gameData: GameStartResponse) => {

        if (!gameData.narration || !gameData.availableCards || gameData.availableCards.length === 0) {
          console.error('❌ Dados do jogo incompletos:', gameData);

          if (action === 'resume') {
            this.startGameFromScratch(campaignId);
            return;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Dados do jogo incompletos. Tente novamente.',
          });
          this.isLoading.set(false);
          return;
        }

        this.currentNarration.set(gameData.narration);
        this.availableCards.set(gameData.availableCards);
        this.gameState.set(gameData.gameState);
        this.narrationHistory.set([gameData.narration]);
        this.isLoading.set(false);

        // Não reproduz automaticamente - usuário deve clicar para ouvir
        console.log('🎵 Narração carregada. Clique no botão de reproduzir para ouvir.');
      },
      error: (error) => {
        console.error('❌ Erro ao carregar jogo:', error);
        this.isLoading.set(false);

        let errorMessage = action === 'resume'
          ? 'Erro ao continuar o jogo.'
          : 'Erro ao iniciar o jogo.';

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

  private startGameFromScratch(campaignId: string) {

    this.campaignService.startGame(campaignId).subscribe({
      next: (gameData: GameStartResponse) => {

        this.currentNarration.set(gameData.narration);
        this.availableCards.set(gameData.availableCards);
        this.gameState.set(gameData.gameState);
        this.narrationHistory.set([gameData.narration]);
        this.isLoading.set(false);

        // Não reproduz automaticamente - usuário deve clicar para ouvir
        console.log('🎵 Narração carregada. Clique no botão de reproduzir para ouvir.');
      },
      error: (error) => {
        console.error('❌ Erro ao iniciar jogo do zero:', error);
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

  selectCard(actionCard: ActionCard) {
    if (this.isPlayingAction() || this.isGameOver()) return;

    if (this.selectedCard()?.actionId === actionCard.actionId) {
      this.executeAction(actionCard);
      return;
    }

    this.selectedCard.set(actionCard);
    this.showCardConfirmation.set(true);
  }

  executeAction(actionCard: ActionCard) {
    const campaign = this.selectedCampaign();
    if (!campaign || this.isPlayingAction() || this.isGameOver()) return;

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

    this.selectedCard.set(null);
    this.showCardConfirmation.set(false);

    this.isPlayingAction.set(true);

    this.campaignService.playGame(campaignId, { actionId: actionCard.actionId }).subscribe({
      next: (response: GamePlayResponse) => {

        this.currentNarration.set(response.narration);
        this.availableCards.set(response.availableCards);
        this.gameState.set(response.gameState);

        const history = this.narrationHistory();
        history.push(response.narration);
        this.narrationHistory.set([...history]);

        if (response.isGameOver) {/* Lines 232-234 omitted */}

        this.isPlayingAction.set(false);

        // Só reproduz automaticamente se o auto-play estiver habilitado
        if (this.autoPlayEnabled()) {
          this.speakNarration(response.narration);
        } else {
          console.log('🎵 Nova narração disponível. Clique no botão de reproduzir para ouvir.');
        }
      },
      error: (error) => {
        console.error('❌ Erro ao executar ação:', error);
        this.isPlayingAction.set(false);

        let errorMessage = 'Erro ao executar ação.';

        if (error.status === 401) {/* Lines 248-253 omitted */} else if (error.status === 400) {/* Lines 254-255 omitted */} else if (error.status === 0) {/* Lines 256-257 omitted */}

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
        });
      },
    });
  }

  cancelCardSelection() {
    this.selectedCard.set(null);
    this.showCardConfirmation.set(false);
  }

  playAction(actionCard: ActionCard) {
    this.selectCard(actionCard);
  }

  private speakNarration(text: string) {
    // Só reproduz automaticamente se o usuário já deu permissão
    if (!this.autoPlayEnabled()) {
      console.log('🔇 Auto-play de áudio desabilitado. Usuário deve clicar em reproduzir.');
      return;
    }

    if (this.isSpeaking()) {
      this.stopNarration();
    }

    this.isSpeaking.set(true);

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

        // Define o volume baseado no controle
        this.audioElement.volume = this.narrationVolume() / 100;

        this.audioElement.onloadeddata = () => {
          console.log('🎵 Áudio carregado do backend');
        };

        this.audioElement.onended = () => {
          this.isSpeaking.set(false);
          this.isPaused.set(false);
          if (this.audioElement) {
            URL.revokeObjectURL(this.audioElement.src);
            this.audioElement = null;
          }
        };

        this.audioElement.onerror = () => {
          console.error('❌ Erro ao reproduzir áudio do backend');
          this.isSpeaking.set(false);
          this.isPaused.set(false);
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
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = this.narrationVolume() / 100;

      utterance.onstart = () => {
        console.log('🎵 Narração iniciada via navegador');
      };

      utterance.onend = () => {
        this.isSpeaking.set(false);
      };

      utterance.onerror = (event) => {
        console.error('❌ Erro na narração do navegador:', event);
        this.isSpeaking.set(false);

        if (event.error === 'not-allowed') {
          console.log('🔇 Permissão de áudio negada pelo navegador');
          this.audioPermissionGranted.set(false);
          this.autoPlayEnabled.set(false);
        }
      };

      speechSynthesis.speak(utterance);
    } else {
      console.warn('⚠️ Text-to-Speech não disponível');
      this.isSpeaking.set(false);
    }
  }

  stopNarration() {

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
    if (this.isSpeaking() && !this.isPaused()) {
      this.pauseNarration();
    } else if (this.isPaused()) {
      this.resumeNarration();
    } else {
      // Habilita auto-play na primeira interação do usuário
      if (!this.autoPlayEnabled()) {
        this.autoPlayEnabled.set(true);
        this.audioPermissionGranted.set(true);
        console.log('🔊 Auto-play de áudio habilitado após interação do usuário');
      }

      const currentText = this.currentNarration();
      if (currentText) {
        this.speakNarration(currentText);
      }
    }
  }

  pauseNarration() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.isPaused.set(true);
    } else if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.pause();
      this.isPaused.set(true);
    }
  }

  resumeNarration() {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play();
      this.isPaused.set(false);
    } else if ('speechSynthesis' in window && speechSynthesis.paused) {
      speechSynthesis.resume();
      this.isPaused.set(false);
    }
  }

  onVolumeChange(volume: number) {
    this.narrationVolume.set(volume);

    if (this.audioElement) {
      this.audioElement.volume = volume / 100;
    }

  }

  goBack(): void {
    this.location.back();
  }

  backToCampaigns(): void {
    this.router.navigate(['/my-campaigns']);
  }

  showPauseCampaignModal(): void {
    this.showPauseModal.set(true);
  }

  closePauseModal(): void {
    this.showPauseModal.set(false);
  }

  pauseAndExit(): void {
    this.stopNarration();


    this.messageService.add({
      severity: 'info',
      summary: 'Campanha Pausada',
      detail: 'Seu progresso foi salvo. Você pode continuar depois.',
    });

    setTimeout(() => {
      this.router.navigate(['/my-campaigns']);
    }, 1500);
  }

  exitWithoutSaving(): void {
    this.stopNarration();

    const campaign = this.selectedCampaign();
    if (!campaign) {
      this.router.navigate(['/my-campaigns']);
      return;
    }

    const campaignId = campaign.id || (campaign as any)._id;

    if (!campaignId) {
      console.error('❌ ID da campanha não encontrado para reset:', campaign);
      this.router.navigate(['/my-campaigns']);
      return;
    }

    this.campaignService.resetCampaign(campaignId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Progresso Descartado',
          detail: 'Você saiu sem salvar. O progresso foi descartado.',
        });

        setTimeout(() => {
          this.router.navigate(['/my-campaigns']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erro ao resetar campanha:', error);

        this.messageService.add({
          severity: 'warn',
          summary: 'Saindo da Campanha',
          detail: 'Retornando à lista de campanhas...',
        });

        setTimeout(() => {
          this.router.navigate(['/my-campaigns']);
        }, 1000);
      }
    });
  }

  getCampaignName(): string {
    const campaign = this.selectedCampaign();
    return campaign?.campaignName || 'Campanha';
  }

  getActionIcon(actionId: string): string {
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
        /* Line 506 omitted */
      case 'lose':
        /* Line 508 omitted */
      case 'draw':
        /* Line 510 omitted */
      default:
        return 'Jogo Finalizado';
    }
  }

  getGameContextLabel(): string {
    const gameContext = this.gameState()?.gameContext;
    switch (gameContext) {
      case 'meio_campo':
        return 'Meio-campo';
      case 'ataque':
        return 'Ataque';
      case 'chance_clara_de_gol':
        return 'Chance clara de gol';
      case 'defesa_pressionada':
        return 'Defesa pressionada';
      default:
        return 'Jogo em andamento';
    }
  }

  getContextIcon(context?: string): string {
    switch (context) {
      case 'meio_campo':
        return 'pi pi-arrows-alt';
      case 'ataque':
        return 'pi pi-angle-double-up';
      case 'chance_clara_de_gol':
        return 'pi pi-star-fill';
      case 'defesa_pressionada':
        return 'pi pi-shield';
      default:
        return 'pi pi-circle';
    }
  }

  // getContextColor(context?: string): string {
  //   switch (context) {
  //     case 'meio_campo':
  //       return '#4CAF50'; // Verde
  //     case 'ataque':
  //       return '#FF9800'; // Laranja
  //     case 'chance_clara_de_gol':
  //       return '#FFD700'; // Dourado
  //     case 'defesa_pressionada':
  //       return '#F44336'; // Vermelho
  //     default:
  //       return '#607D8B'; // Cinza azulado
  //   }
  // }
}
