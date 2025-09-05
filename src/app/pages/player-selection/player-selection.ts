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

// Models
import { PlayerArchetype, Player } from '../../models/player';

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
  styleUrls: ['./player-selection.scss'],
  providers: [MessageService]
})
export class PlayerSelection implements OnInit {
  // Signals para gerenciar o estado
  isLoading = signal(true);
  showNameDialog = signal(false);
  selectedArchetype = signal<PlayerArchetype | null>(null);
  playerName = signal('');

  // Dados dos arquétipos de jogadores
  playerArchetypes = signal<PlayerArchetype[]>([
    {
      id: 'speedster',
      name: 'O Velocista',
      title: 'Rápido como o Vento',
      description: 'Especialista em velocidade e dribles. Perfeito para quem gosta de correr pelos flancos e superar defensores.',
      image: 'placeholder-speedster',
      attributes: {
        speed: 95,
        shooting: 70,
        passing: 75,
        defense: 40,
        leadership: 60
      },
      primaryColor: '#FF6B35',
      secondaryColor: '#FFE66D'
    },
    {
      id: 'striker',
      name: 'O Artilheiro',
      title: 'Máquina de Gols',
      description: 'Especialista em finalização. Tem o faro de gol e a precisão necessária para decidir partidas.',
      image: 'placeholder-striker',
      attributes: {
        speed: 75,
        shooting: 95,
        passing: 70,
        defense: 35,
        leadership: 70
      },
      primaryColor: '#E74C3C',
      secondaryColor: '#F39C12'
    },
    {
      id: 'maestro',
      name: 'O Maestro',
      title: 'Cérebro do Time',
      description: 'Mestre dos passes e da visão de jogo. Controla o ritmo da partida e cria as melhores oportunidades.',
      image: 'placeholder-maestro',
      attributes: {
        speed: 65,
        shooting: 70,
        passing: 95,
        defense: 60,
        leadership: 85
      },
      primaryColor: '#3498DB',
      secondaryColor: '#9B59B6'
    },
    {
      id: 'defender',
      name: 'O Defensor',
      title: 'Muralha Impenetrável',
      description: 'Especialista em marcação e interceptações. A última linha de defesa e o primeiro passo para o ataque.',
      image: 'placeholder-defender',
      attributes: {
        speed: 60,
        shooting: 45,
        passing: 80,
        defense: 95,
        leadership: 80
      },
      primaryColor: '#27AE60',
      secondaryColor: '#2ECC71'
    },
    {
      id: 'leader',
      name: 'O Líder',
      title: 'Capitão Natural',
      description: 'Jogador completo e inspirador. Equilibra todas as habilidades e motiva o time nos momentos decisivos.',
      image: 'placeholder-leader',
      attributes: {
        speed: 80,
        shooting: 80,
        passing: 85,
        defense: 75,
        leadership: 95
      },
      primaryColor: '#8E44AD',
      secondaryColor: '#D35400'
    }
  ]);

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
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Simula carregamento inicial com animação
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
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

    // Cria o objeto do jogador
    const newPlayer: Player = {
      name: name,
      archetype: archetype,
      level: 1,
      experience: 0
    };

    // Salva no localStorage (em uma implementação real, seria enviado para o backend)
    localStorage.setItem('selectedPlayer', JSON.stringify(newPlayer));

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
      leader: 'pi pi-star'
    };
    return icons[archetypeId] || 'pi pi-user';
  }
}
