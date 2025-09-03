import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-screen.html',
  styleUrls: ['./loading-screen.scss']
})
export class LoadingScreen implements OnInit, OnDestroy {
  private progressInterval?: number;

  // Propriedades públicas para o template
  isExiting = false;
  loadingProgress = 0;
  currentStage = 1;
  currentLoadingText = 'Inicializando sistema...';
  logoError = false;
  particles: any[] = [];

  // Estágios simplificados
  loadingStages = [
    { icon: 'pi pi-cog', text: 'Inicializando sistema' },
    { icon: 'pi pi-users', text: 'Carregando jogadores' },
    { icon: 'pi pi-map', text: 'Preparando campo' },
    { icon: 'pi pi-check-circle', text: 'Finalizando carregamento' }
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // console.log('LoadingScreen constructor - Progress inicial:', this.loadingProgress);
  }

  ngOnInit(): void {
    // console.log('LoadingScreen ngOnInit - Progress:', this.loadingProgress);
    this.initParticles();

    // Inicia o progresso imediatamente
    setTimeout(() => {
      this.startProgress();
    }, 100);
  }

  ngOnDestroy(): void {
    this.clearProgress();
  }

  private initParticles(): void {
    // Cria 20 partículas simples
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        delay: Math.random() * 3
      });
    }
  }

  private startProgress(): void {
    // console.log('Iniciando progresso...');

    this.progressInterval = setInterval(() => {
      if (this.loadingProgress < 100) {
        this.loadingProgress += 5; // 5% por vez para ser mais rápido
        this.updateStageAndText();
        this.cdr.markForCheck();
        // console.log('Progresso:', this.loadingProgress + '%', 'Estágio:', this.currentStage);
      } else {
        this.completeLoading();
      }
    }, 200);
  }

  private updateStageAndText(): void {
    // Atualiza o estágio baseado no progresso
    if (this.loadingProgress >= 0 && this.loadingProgress < 25) {
      this.currentStage = 1;
      this.currentLoadingText = this.loadingStages[0].text;
    } else if (this.loadingProgress >= 25 && this.loadingProgress < 50) {
      this.currentStage = 2;
      this.currentLoadingText = this.loadingStages[1].text;
    } else if (this.loadingProgress >= 50 && this.loadingProgress < 75) {
      this.currentStage = 3;
      this.currentLoadingText = this.loadingStages[2].text;
    } else if (this.loadingProgress >= 75) {
      this.currentStage = 4;
      this.currentLoadingText = this.loadingStages[3].text;
    }

    if (this.loadingProgress >= 100) {
      this.currentLoadingText = 'Carregamento concluído!';
    }
  }

  private completeLoading(): void {
    // console.log('Carregamento finalizado!');
    this.clearProgress();

    setTimeout(() => {
      this.isExiting = true;
      this.currentLoadingText = 'Entrando no jogo...';

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);
    }, 500);
  }

  private clearProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }
}
