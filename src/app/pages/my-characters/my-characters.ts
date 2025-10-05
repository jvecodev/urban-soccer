import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Button } from '../../components/atoms/button/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { MessageService, ConfirmationService } from 'primeng/api';

import { UserCharacter, UserCharacterUpdate } from '../../models/userCharacter';
import { UserCharacterService } from '../../services/userCharacter.service';
import { PlayerService } from '../../services/player.service';
import { PlayerArchetype } from '../../models/player';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-my-characters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ToastModule,
    Button,
    ButtonModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  templateUrl: './my-characters.html',
  styleUrls: ['./my-characters.scss'],
  providers: [MessageService, ConfirmationService],
})

/**
 * @class MyCharacters
 * @description Componente que exibe a lista de personagens do usuário, permitindo criar, editar e deletar personagens
 * @implements OnInit
 * @method goToPlayerSelection - Navega para a página de seleção de jogador para criar um novo personagem
 * @method ngOnInit - Inicializa o componente e carrega os personagens do usuário
 * @method loadMyCharacters - Carrega os personagens do usuário a partir do serviço
 * @method refreshCharacters - Recarrega a lista de personagens
 * @method selectCharacter - Seleciona um personagem e navega para a seleção de campanha
 * @method editCharacter - Abre o diálogo de edição para o personagem selecionado
 * @method confirmEdit - Confirma a edição do nome do personagem
 * @method deleteCharacter - Deleta o personagem selecionado após confirmação
 * @method closeEditDialog - Fecha o diálogo de edição e limpa os dados temporários
 * @method getArchetypeIcon - Retorna o ícone associado ao arquétipo do personagem
 * @method getArchetypeName - Retorna o nome do arquétipo do personagem
 * @method getPlayerRarity - Retorna a raridade do jogador (Comum ou Único)
 * @method getPlayerImage - Retorna a URL da imagem do jogador
 * @method getPlayerStats - Retorna as estatísticas do jogador
 * @method createNewCharacter - Navega para a página de seleção de jogador para criar um novo personagem
 * @method navigateToHome - Navega para a página inicial
 * @method navigateToDashboard - Navega para o dashboard do usuário
 * @method onImageError - Manipula erros de carregamento de imagem, exibindo um overlay
 * @method getAttributeColor - Retorna a cor associada a um valor de atributo específico
 */

export class MyCharacters implements OnInit {
  isLoading = signal(true);
  myCharacters = signal<UserCharacter[]>([]);
  showEditDialog = signal(false);
  editingCharacter = signal<UserCharacter | null>(null);
  newCharacterName = signal('');
  playerArchetypes = signal<{ [key: string]: PlayerArchetype }>({});

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userCharacterService: UserCharacterService,
    private playerService: PlayerService,
    private auth: Auth,
    private location: Location
  ) {}

  goToPlayerSelection(): void {
    this.router.navigate(['/player-selection']);
  }

  ngOnInit() {
    this.loadMyCharacters();
  }

  private loadMyCharacters() {
    this.isLoading.set(true);

    this.userCharacterService.getUserCharacters().subscribe({
      next: (characters) => {
        this.myCharacters.set(characters);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar personagens:', error);
        this.isLoading.set(false);

        let errorMessage = 'Erro ao carregar seus personagens.';

        if (error.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 0) {
          errorMessage =
            'Problema de conectividade. Verifique se a API está rodando.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
        });
      },
    });
  }

  refreshCharacters() {
    this.loadMyCharacters();
  }

  selectCharacter(character: UserCharacter) {
    if (!character.player) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Dados incompletos',
        detail: 'Os dados do personagem não foram carregados completamente.',
      });
      return;
    }

    const playerData = {
      id: character.player._id,
      name: character.characterName,
      archetype: {
        id: character.player._id,
        name: character.player.name,
        title: character.player.name,
        description: character.player.description,
        image: character.player.imageUrl,
        attributes: {
          speed: character.player.stats.speed,
          shooting: character.player.stats.attack,
          passing: character.player.stats.leadership,
          defense: character.player.stats.defense,
          leadership: character.player.stats.leadership,
        },
        primaryColor:
          character.player.rarity === 'unique' ? '#7C2C78' : '#1095CF',
        secondaryColor:
          character.player.rarity === 'unique' ? '#EB6E19' : '#30C9F9',
        rarity: character.player.rarity,
        stats: character.player.stats,
      },
      level: 1,
      experience: 0,
    };

    localStorage.setItem('selectedPlayer', JSON.stringify(playerData));
    localStorage.setItem('selectedUserCharacter', JSON.stringify(character));

    if (character.player.stats) {
      localStorage.setItem(
        'playerStats',
        JSON.stringify(character.player.stats)
      );
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Personagem Selecionado',
      detail: `${character.characterName} foi selecionado! Gerando campanhas...`,
    });

    setTimeout(() => {
      this.router.navigate(['/campaign-selection']);
    }, 1500);
  }

  editCharacter(character: UserCharacter) {
    this.editingCharacter.set(character);
    this.newCharacterName.set(character.characterName);
    this.showEditDialog.set(true);
  }

  confirmEdit() {
    const character = this.editingCharacter();
    const newName = this.newCharacterName().trim();

    if (!character || !newName) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome Obrigatório',
        detail: 'Por favor, insira um nome válido.',
      });
      return;
    }

    if (newName.length < 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome muito curto',
        detail: 'O nome deve ter pelo menos 2 caracteres.',
      });
      return;
    }

    if (newName === character.characterName) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sem alterações',
        detail: 'O nome não foi alterado.',
      });
      this.closeEditDialog();
      return;
    }

    const updateData: UserCharacterUpdate = {
      characterName: newName,
    };


    this.userCharacterService
      .updateUserCharacter(character._id!, updateData)
      .subscribe({
        next: (updatedCharacter) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Personagem Atualizado',
            detail: `Nome alterado para ${newName}!`,
          });

          this.closeEditDialog();

          setTimeout(() => {
            this.loadMyCharacters();
          }, 500);
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar personagem:', error);

          let errorMessage = 'Erro ao atualizar personagem.';
          if (error.status === 400) {
            errorMessage = 'Este nome já está em uso ou é inválido.';
          } else if (error.status === 404) {
            errorMessage = 'Personagem não encontrado.';
          } else if (error.status === 401) {
            errorMessage = 'Você precisa estar logado para editar personagens.';
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: errorMessage,
          });
        },
      });
  }

  deleteCharacter(character: UserCharacter) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja deletar "${character.characterName}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.userCharacterService
          .deleteUserCharacter(character._id!)
          .subscribe({
            next: () => {
              const currentCharacters = this.myCharacters();
              const updatedList = currentCharacters.filter(
                (char) => char._id !== character._id
              );
              this.myCharacters.set(updatedList);

              this.messageService.add({
                severity: 'success',
                summary: 'Personagem Deletado',
                detail: `${character.characterName} foi removido.`,
              });
            },
            error: (error) => {
              console.error('❌ Erro ao deletar personagem:', error);

              let errorMessage = 'Erro ao deletar personagem.';
              if (error.status === 404) {
                errorMessage = 'Personagem não encontrado.';
              } else if (error.status === 401) {
                errorMessage =
                  'Você precisa estar logado para deletar personagens.';
              }

              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: errorMessage,
              });
            },
          });
      },
    });
  }

  closeEditDialog() {
    this.showEditDialog.set(false);
    this.editingCharacter.set(null);
    this.newCharacterName.set('');
  }

  getArchetypeIcon(character: UserCharacter): string {
    if (character.player) {
      const playerName = character.player.name.toLowerCase();

      const icons: { [key: string]: string } = {
        velocista: 'pi pi-bolt',
        speedster: 'pi pi-bolt',
        maestro: 'pi pi-send',
        artilheiro: 'pi pi-target',
        striker: 'pi pi-target',
        defensor: 'pi pi-shield',
        defender: 'pi pi-shield',
        lider: 'pi pi-star',
        leader: 'pi pi-star',
        'cavaleiro-sombrio': 'pi pi-shield',
        'arqueiro-elfico': 'pi pi-target',
        'paladino-dourado': 'pi pi-shield',
        'mago-das-chamas': 'pi pi-bolt',
        'ladino-sombrio': 'pi pi-eye',
      };

      return icons[playerName] || 'pi pi-user';
    }

    return 'pi pi-user';
  }

  getArchetypeName(character: UserCharacter): string {
    if (character.player) {
      return character.player.name;
    }
    return 'Personagem Desconhecido';
  }



  getPlayerRarity(character: UserCharacter): string {
    if (character.player) {
      return character.player.rarity === 'unique' ? 'Único' : 'Comum';
    }
    return 'Comum';
  }

  getPlayerImage(character: UserCharacter): string {
    if (character.player && character.player.imageUrl) {
      return character.player.imageUrl;
    }
    return 'assets/imgs/urbanSoccer.png';
  }

  getPlayerStats(character: UserCharacter) {
    if (character.player && character.player.stats) {
      return character.player.stats;
    }
    return null;
  }

  createNewCharacter() {
    this.router.navigate(['/player-selection']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';

      const imageContainer = target.closest('.character-image-top');
      if (imageContainer) {
        const overlay = imageContainer.querySelector('.image-overlay') as HTMLElement;
        if (overlay) {
          overlay.style.display = 'flex';
        }
      }
    }
  }

  getAttributeColor(value: number): string {
    if (value >= 80) return 'var(--amarelo-dourado)';
    if (value >= 60) return 'var(--ciano-eletrico)';
    if (value >= 40) return 'var(--azul-acento)';
    return 'var(--cinza-neutro)';
  }
}
