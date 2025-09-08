import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../../components/atoms/button/button';

import { MessageService } from 'primeng/api';

import { PlayerArchetype, Player } from '../../models/player';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    CarouselModule,
    TagModule,
    ProgressBarModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    Button
  ],
  templateUrl: './player-selection.html',
  styleUrls: ['./player-selection-new.scss'],
  providers: [MessageService]
})
export class PlayerSelection implements OnInit {
  isLoading = signal(true);
  showNameDialog = signal(false);
  selectedArchetype = signal<PlayerArchetype | null>(null);
  playerName = signal('');
  loadingError = signal<string | null>(null);
  playerArchetypes = signal<PlayerArchetype[]>([]);

  carouselOptions = {
    numVisible: 3,
    numScroll: 1,
    circular: true
  };

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private router: Router,
    private messageService: MessageService,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.loadPlayers();
  }

  // Carrega os players da API
  private loadPlayers() {
    this.isLoading.set(true);
    this.loadingError.set(null);

    this.playerService.getPlayersWithFallback().subscribe({
      next: (players) => {
        this.playerArchetypes.set(players);
        this.isLoading.set(false);

        if (players.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Nenhum personagem disponível no momento.'
          });
        }
      },
      error: (error) => {
        console.error('Erro ao carregar players:', error);
        this.loadingError.set('Erro ao carregar personagens. Usando dados locais.');
        this.isLoading.set(false);

        this.messageService.add({
          severity: 'warn',
          summary: 'Conectividade',
          detail: 'Usando personagens offline. Verifique sua conexão.'
        });
      }
    });
  }

  selectArchetype(archetype: PlayerArchetype) {
    this.selectedArchetype.set(archetype);
    this.showNameDialog.set(true);
  }

  confirmPlayerCreation() {
    const name = this.playerName().trim();
    const archetype = this.selectedArchetype();

    if (!name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome Obrigatório',
        detail: 'Por favor, insira um nome para o seu jogador.'
      });
      return;
    }

    if (!archetype) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nenhum arquétipo selecionado.'
      });
      return;
    }

    const newPlayer: Player = {
      id: archetype.id,
      name: name,
      archetype: archetype,
      level: 1,
      experience: 0
    };

    localStorage.setItem('selectedPlayer', JSON.stringify(newPlayer));

    if (archetype.stats) {
      localStorage.setItem('playerStats', JSON.stringify(archetype.stats));
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Jogador Criado!',
      detail: `${name}, o ${archetype.name}, foi criado com sucesso!`
    });

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 2000);
  }

  cancelSelection() {
    this.showNameDialog.set(false);
    this.selectedArchetype.set(null);
    this.playerName.set('');
  }

  reloadPlayers() {
    this.loadPlayers();
  }

  getAttributeColor(value: number): string {
    if (value >= 90) return '#27AE60'; // Verde
    if (value >= 75) return '#F39C12'; // Laranja
    if (value >= 60) return '#3498DB'; // Azul
    return '#95A5A6'; // Cinza
  }

  getAttributeIcon(attributeName: string): string {
    const icons: { [key: string]: string } = {
      speed: 'pi pi-bolt',
      shooting: 'pi pi-target',
      passing: 'pi pi-send',
      defense: 'pi pi-shield',
      leadership: 'pi pi-star'
    };
    return icons[attributeName] || 'pi pi-circle';
  }

  getArchetypeIcon(archetypeId: string): string {
    const icons: { [key: string]: string } = {
      'velocista': 'pi pi-bolt',
      'maestro': 'pi pi-send',
      'artilheiro': 'pi pi-target',
      'o artilheiro': 'pi pi-target',
      'defensor': 'pi pi-shield',
      'lider': 'pi pi-star',
      'speedster': 'pi pi-bolt',
      'striker': 'pi pi-target',
      'defender': 'pi pi-shield',
      'leader': 'pi pi-star',
      'cavaleiro-sombrio': 'pi pi-shield',
      'arqueiro-elfico': 'pi pi-target',
      'paladino-dourado': 'pi pi-shield',
      'mago-das-chamas': 'pi pi-bolt',
      'ladino-sombrio': 'pi pi-eye'
    };

    const lowercaseId = archetypeId.toLowerCase();
    return icons[archetypeId] || icons[lowercaseId] || 'pi pi-user';
  }

  onImageError(event: any, archetype: PlayerArchetype) {
    console.warn(`Erro ao carregar imagem para ${archetype.name}: ${archetype.image}`);
    event.target.style.display = 'none';
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
