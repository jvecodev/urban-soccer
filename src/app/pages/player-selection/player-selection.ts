import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

// PrimeNG Services
import { MessageService } from 'primeng/api';

// Models and Services
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
    InputTextModule
  ],
  templateUrl: './player-selection.html',
  styleUrls: ['./player-selection-new.scss'],
  providers: [MessageService]
})
export class PlayerSelection implements OnInit {
  // Signals para gerenciar o estado
  isLoading = signal(true);
  showNameDialog = signal(false);
  selectedArchetype = signal<PlayerArchetype | null>(null);
  playerName = signal('');
  loadingError = signal<string | null>(null);

  // Dados dos arquétipos de jogadores (carregados da API)
  playerArchetypes = signal<PlayerArchetype[]>([]);

  // Opções do carousel
  carouselOptions = {
    numVisible: 3,
    numScroll: 1,
    circular: true
  };

  // Responsive options para o carousel
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

  // Seleciona um arquétipo de jogador
  selectArchetype(archetype: PlayerArchetype) {
    this.selectedArchetype.set(archetype);
    this.showNameDialog.set(true);
  }

  // Confirma a criação do jogador
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

    // Cria o objeto do jogador com dados da API
    const newPlayer: Player = {
      id: archetype.id,
      name: name,
      archetype: archetype,
      level: 1,
      experience: 0
    };

    // Salva no localStorage (em uma implementação real, seria enviado para o backend)
    localStorage.setItem('selectedPlayer', JSON.stringify(newPlayer));

    // Salva também dados extras da API
    if (archetype.stats) {
      localStorage.setItem('playerStats', JSON.stringify(archetype.stats));
    }

    // Mostra mensagem de sucesso
    this.messageService.add({
      severity: 'success',
      summary: 'Jogador Criado!',
      detail: `${name}, o ${archetype.name}, foi criado com sucesso!`
    });

    // Redireciona para o dashboard após um delay
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 2000);
  }

  // Cancela a seleção
  cancelSelection() {
    this.showNameDialog.set(false);
    this.selectedArchetype.set(null);
    this.playerName.set('');
  }

  // Recarrega os players da API
  reloadPlayers() {
    this.loadPlayers();
  }

  // Retorna a cor do atributo baseado no valor
  getAttributeColor(value: number): string {
    if (value >= 90) return '#27AE60'; // Verde
    if (value >= 75) return '#F39C12'; // Laranja
    if (value >= 60) return '#3498DB'; // Azul
    return '#95A5A6'; // Cinza
  }

  // Retorna o ícone do atributo
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

  // Retorna o ícone do arquétipo
  getArchetypeIcon(archetypeId: string): string {
    const icons: { [key: string]: string } = {
      speedster: 'pi pi-bolt',
      striker: 'pi pi-target',
      maestro: 'pi pi-send',
      defender: 'pi pi-shield',
      leader: 'pi pi-star',
      // IDs da API
      'cavaleiro-sombrio': 'pi pi-shield',
      'arqueiro-elfico': 'pi pi-target',
      'paladino-dourado': 'pi pi-shield',
      'mago-das-chamas': 'pi pi-bolt',
      'ladino-sombrio': 'pi pi-eye'
    };
    return icons[archetypeId] || 'pi pi-user';
  }

  // Trata erro de carregamento de imagem
  onImageError(event: any, archetype: PlayerArchetype) {
    console.warn(`Erro ao carregar imagem para ${archetype.name}: ${archetype.image}`);
    // Esconde a imagem e mostra o placeholder
    event.target.style.display = 'none';
  }
}
