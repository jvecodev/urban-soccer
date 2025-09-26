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
  ],
  templateUrl: './my-campaigns.html',
  styleUrls: ['./my-campaigns.scss'],
  providers: [MessageService],
})
export class MyCampaigns implements OnInit {
  isLoading = signal(true);
  campaigns = signal<Campaign[]>([]);

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


    localStorage.setItem('selectedCampaign', JSON.stringify(campaign));

    this.messageService.add({
      severity: 'success',
      summary: 'Campanha Selecionada!',
      detail: `${campaign.campaignName} foi selecionada!`,
    });

    setTimeout(() => {
      this.router.navigate(['/game-start']);
    }, 1000);
  }

  createNewCampaign() {
    this.router.navigate(['/my-characters']);
  }

  deleteCampaign(campaign: Campaign) {
    if (confirm(`Tem certeza que deseja deletar a campanha "${campaign.campaignName}"? Esta ação não pode ser desfeita.`)) {
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
        },
      });
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
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'paused':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'completed':
        return 'Concluída';
      case 'paused':
        return 'Pausada';
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
    if (!progress || !progress.totalLevels || progress.totalLevels === 0) {
      return 0;
    }
    return Math.round((progress.currentLevel / progress.totalLevels) * 100);
  }
}
