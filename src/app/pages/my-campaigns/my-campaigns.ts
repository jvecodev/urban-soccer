import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-my-campaigns',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SkeletonModule,
    TagModule,
    DialogModule,
  ],
  templateUrl: './my-campaigns.html',
  styleUrls: ['./my-campaigns.scss'],
  providers: [MessageService],
})
export class MyCampaigns implements OnInit {
  isLoading = signal(true);
  campaigns = signal<Campaign[]>([]);

  // Modal de confirmação de exclusão
  showDeleteModal = signal(false);
  campaignToDelete = signal<Campaign | null>(null);

  // Modal de resumo da campanha
  showSummaryModal = signal(false);
  campaignToReview = signal<Campaign | null>(null);

  constructor(
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private campaignService: CampaignService,
    private auth: Auth
  ) {}

  ngOnInit() {
    // Verifica se o usuário está autenticado antes de prosseguir
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

    this.loadUserCampaigns();
  }

  private loadUserCampaigns() {
    this.campaignService.getUserCampaigns().subscribe({
      next: (campaigns) => {
        this.campaigns.set(campaigns);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar campanhas:', error);
        this.isLoading.set(false);

        let errorMessage = 'Erro ao carregar suas campanhas.';

        if (error.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          this.auth.logout();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
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

  selectCampaign(campaign: Campaign) {
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

    localStorage.setItem('selectedCampaign', JSON.stringify(campaign));

    // Verifica o status da campanha para decidir a ação
    if (campaign.status === 'abandoned' || campaign.status === 'completed') {
      this.reviewCampaign(campaign);
    } else if (this.hasRealProgress(campaign)) {
      // Só usa resume se realmente tem progresso (ações jogadas)
      this.resumeCampaign(campaign);
    } else {
      // Sempre usa start se não há progresso real, mesmo se já foi "iniciada"
      this.startCampaign(campaign);
    }
  }

  private startCampaign(campaign: Campaign) {
    this.messageService.add({
      severity: 'success',
      summary: 'Iniciando Campanha!',
      detail: `Iniciando ${campaign.campaignName}...`,
    });

    setTimeout(() => {
      this.router.navigate(['/game-start'], {
        queryParams: { action: 'start', campaignId: campaign.id || (campaign as any)._id }
      });
    }, 1000);
  }

  private resumeCampaign(campaign: Campaign) {
    this.messageService.add({
      severity: 'info',
      summary: 'Continuando Campanha!',
      detail: `Continuando ${campaign.campaignName}...`,
    });

    setTimeout(() => {
      this.router.navigate(['/game-start'], {
        queryParams: { action: 'resume', campaignId: campaign.id || (campaign as any)._id }
      });
    }, 1000);
  }

  private reviewCampaign(campaign: Campaign) {
    this.messageService.add({
      severity: 'info',
      summary: 'Revisando Campanha!',
      detail: `Revisando ${campaign.campaignName}...`,
    });

    // Para campanhas finalizadas, podemos mostrar um resumo ou redirecionar para uma página de revisão
    // Por enquanto, vou mostrar os detalhes da campanha sem tentar fazer resume
    setTimeout(() => {
      this.showCampaignSummary(campaign);
    }, 1000);
  }

  createNewCampaign() {
    this.router.navigate(['/my-characters']);
  }

  deleteCampaign(campaign: Campaign) {
    this.campaignToDelete.set(campaign);
    this.showDeleteModal.set(true);
  }

  confirmDeleteCampaign() {
    const campaign = this.campaignToDelete();
    if (!campaign) return;

    const campaignId = campaign.id || (campaign as any)._id;

    if (!campaignId) {
      console.error('❌ ID da campanha não encontrado:', campaign);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID da campanha não encontrado.',
      });
      this.closeDeleteModal();
      return;
    }

    this.campaignService.deleteCampaign(campaignId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Campanha Deletada!',
          detail: `${campaign.campaignName} foi deletada com sucesso.`,
        });

        const currentCampaigns = this.campaigns();
        const updatedCampaigns = currentCampaigns.filter(c => (c.id || (c as any)._id) !== campaignId);
        this.campaigns.set(updatedCampaigns);
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('❌ Erro ao deletar campanha:', error);
        let errorMessage = 'Erro ao deletar campanha.';

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
        this.closeDeleteModal();
      },
    });
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.campaignToDelete.set(null);
  }

  private showCampaignSummary(campaign: Campaign) {
    this.campaignToReview.set(campaign);
    this.showSummaryModal.set(true);
  }

  closeSummaryModal() {
    this.showSummaryModal.set(false);
    this.campaignToReview.set(null);
  }

  getCampaignResult(campaign: Campaign): { result: string; severity: string } {
    const progress = campaign.progress;
    if (progress.score > progress.opponent_score) {
      return { result: 'Vitória', severity: 'success' };
    } else if (progress.score < progress.opponent_score) {
      return { result: 'Derrota', severity: 'danger' };
    } else {
      return { result: 'Empate', severity: 'warning' };
    }
  }

  goBack(): void {
    this.location.back();
  }

  refreshCampaigns() {
    this.isLoading.set(true);
    this.campaigns.set([]);
    this.loadUserCampaigns();
  }

  getStatusSeverity(status: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'not_started':
        return 'secondary';
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'paused':
        return 'warning';
      case 'abandoned':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'not_started':
        return 'Não Iniciada';
      case 'active':
        return 'Ativa';
      case 'completed':
        return 'Concluída';
      case 'paused':
        return 'Pausada';
      case 'abandoned':
        return 'Finalizada';
      default:
        return 'Desconhecido';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getProgressPercentage(progress: any): number {
    if (!progress) {
      return 0;
    }

    // Se tem time (lances jogados), usa como base do progresso
    if (progress.time && progress.time > 0) {
      const maxLances = 10; // Máximo de lances por campanha
      return Math.min(Math.round((progress.time / maxLances) * 100), 100);
    }

    // Fallback para estrutura antiga
    if (progress.totalLevels && progress.totalLevels > 0) {
      return Math.round((progress.currentLevel / progress.totalLevels) * 100);
    }

    return 0;
  }

  /**
   * Verifica se a campanha já foi iniciada
   */
  isCampaignStarted(campaign: Campaign): boolean {
    return campaign.status === 'active' ||
           campaign.status === 'abandoned' ||
           campaign.status === 'completed' ||
           campaign.hasGameStarted === true ||
           !!campaign.lastPlayedDate ||
           (campaign.progress && campaign.progress.time > 0);
  }

  /**
   * Verifica se a campanha teve progresso real (ações jogadas)
   */
  hasRealProgress(campaign: Campaign): boolean {
    return (campaign.progress && campaign.progress.time > 0) ||
           campaign.status === 'completed' ||
           campaign.status === 'abandoned' ||
           !!campaign.lastPlayedDate;
  }

  /**
   * Retorna o texto do botão baseado no status da campanha
   */
  getButtonText(campaign: Campaign): string {
    if (campaign.status === 'abandoned' || campaign.status === 'completed') {
      return 'Revisar';
    }
    if (this.hasRealProgress(campaign)) {
      return 'Continuar';
    }
    return 'Iniciar';
  }

  /**
   * Retorna o ícone do botão baseado no status da campanha
   */
  getButtonIcon(campaign: Campaign): string {
    if (campaign.status === 'abandoned' || campaign.status === 'completed') {
      return 'pi pi-eye';
    }
    if (this.hasRealProgress(campaign)) {
      return 'pi pi-play';
    }
    return 'pi pi-play-circle';
  }

  /**
   * Retorna a severidade do botão baseado no status da campanha
   */
  getButtonSeverity(campaign: Campaign): "success" | "info" | "danger" | "help" | "primary" | "secondary" | "contrast" | undefined {
    if (campaign.status === 'abandoned' || campaign.status === 'completed') {
      return 'info';
    }
    if (this.hasRealProgress(campaign)) {
      return 'success';
    }
    return 'primary';
  }
}
