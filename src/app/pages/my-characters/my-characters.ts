import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';

import { MessageService, ConfirmationService } from 'primeng/api';

import { UserCharacter, UserCharacterUpdate } from '../../models/userCharacter';
import { UserCharacterService } from '../../services/userCharacter.service';
import { PlayerService } from '../../services/player.service';
import { PlayerArchetype } from '../../models/player';

@Component({
  selector: 'app-my-characters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    TagModule
  ],
  templateUrl: './my-characters.html',
  styleUrls: ['./my-characters.scss'],
  providers: [MessageService, ConfirmationService]
})
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
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.loadMyCharacters();
    this.loadPlayerArchetypes();
  }

  private loadMyCharacters() {
    console.log('🔍 Carregando personagens do usuário...');
    this.isLoading.set(true);

    this.userCharacterService.getUserCharacters().subscribe({
      next: (characters) => {
        console.log('✅ Personagens carregados:', characters);
        this.myCharacters.set(characters);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar personagens:', error);
        this.isLoading.set(false);

        let errorMessage = 'Erro ao carregar seus personagens.';
        
        if (error.status === 401) {
          errorMessage = 'Você precisa estar logado para ver seus personagens.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
      }
    });
  }

  private loadPlayerArchetypes() {
    this.playerService.getAvailablePlayers().subscribe({
      next: (players) => {
        const archetypesMap: { [key: string]: PlayerArchetype } = {};
        players.forEach(player => {
          archetypesMap[player.id] = player;
        });
        this.playerArchetypes.set(archetypesMap);
      },
      error: (error) => {
        console.error('Erro ao carregar arquétipos:', error);
      }
    });
  }

  selectCharacter(character: UserCharacter) {
    const archetype = this.playerArchetypes()[character.playerId];

    if (!archetype) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Arquétipo não encontrado',
        detail: 'O arquétipo deste personagem não foi encontrado.'
      });
      return;
    }

    // Salva o personagem selecionado no localStorage
    const playerData = {
      id: archetype.id,
      name: character.characterName,
      archetype: archetype,
      level: 1,
      experience: 0
    };

    localStorage.setItem('selectedPlayer', JSON.stringify(playerData));
    localStorage.setItem('selectedUserCharacter', JSON.stringify(character));

    if (archetype.stats) {
      localStorage.setItem('playerStats', JSON.stringify(archetype.stats));
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Personagem Selecionado',
      detail: `${character.characterName} foi selecionado!`
    });

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
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
        detail: 'Por favor, insira um nome válido.'
      });
      return;
    }

    if (newName.length < 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome muito curto',
        detail: 'O nome deve ter pelo menos 2 caracteres.'
      });
      return;
    }

    if (newName === character.characterName) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sem alterações',
        detail: 'O nome não foi alterado.'
      });
      this.closeEditDialog();
      return;
    }

    const updateData: UserCharacterUpdate = {
      characterName: newName
    };

    console.log('✏️ Atualizando personagem:', character._id, updateData);

    this.userCharacterService.updateUserCharacter(character._id!, updateData).subscribe({
      next: (updatedCharacter) => {
        console.log('✅ Personagem atualizado:', updatedCharacter);
        
        // Atualiza a lista local
        const currentCharacters = this.myCharacters();
        const updatedList = currentCharacters.map(char =>
          char._id === updatedCharacter._id ? updatedCharacter : char
        );
        this.myCharacters.set(updatedList);

        this.messageService.add({
          severity: 'success',
          summary: 'Personagem Atualizado',
          detail: `Nome alterado para ${newName}!`
        });

        this.closeEditDialog();
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
          detail: errorMessage
        });
      }
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
        console.log('🗑️ Deletando personagem:', character._id);
        
        this.userCharacterService.deleteUserCharacter(character._id!).subscribe({
          next: () => {
            console.log('✅ Personagem deletado com sucesso');
            
            // Remove da lista local
            const currentCharacters = this.myCharacters();
            const updatedList = currentCharacters.filter(char => char._id !== character._id);
            this.myCharacters.set(updatedList);

            this.messageService.add({
              severity: 'success',
              summary: 'Personagem Deletado',
              detail: `${character.characterName} foi removido.`
            });
          },
          error: (error) => {
            console.error('❌ Erro ao deletar personagem:', error);

            let errorMessage = 'Erro ao deletar personagem.';
            if (error.status === 404) {
              errorMessage = 'Personagem não encontrado.';
            } else if (error.status === 401) {
              errorMessage = 'Você precisa estar logado para deletar personagens.';
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: errorMessage
            });
          }
        });
      }
    });
  }

  closeEditDialog() {
    this.showEditDialog.set(false);
    this.editingCharacter.set(null);
    this.newCharacterName.set('');
  }

  getArchetypeIcon(playerId: string): string {
    const icons: { [key: string]: string } = {
      'velocista': 'pi pi-bolt',
      'maestro': 'pi pi-send',
      'artilheiro': 'pi pi-target',
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

    const lowercaseId = playerId.toLowerCase();
    return icons[playerId] || icons[lowercaseId] || 'pi pi-user';
  }

  getArchetypeName(playerId: string): string {
    const archetype = this.playerArchetypes()[playerId];
    return archetype ? archetype.name : 'Arquétipo Desconhecido';
  }

  createNewCharacter() {
    this.router.navigate(['/player-selection']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
