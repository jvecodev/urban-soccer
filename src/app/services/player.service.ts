import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Api } from './api';
import { ApiPlayer, PlayerListResponse, PlayerArchetype } from '../models/player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor(private api: Api) {}

  /**
   * Busca todos os players disponíveis na API
   */
  getAvailablePlayers(): Observable<PlayerArchetype[]> {
    return this.api.get<PlayerListResponse>('/players/available')
      .pipe(
        map(response => this.convertApiPlayersToArchetypes(response.players))
      );
  }

  /**
   * Busca players por raridade
   */
  getPlayersByRarity(rarity: 'default' | 'unique'): Observable<PlayerArchetype[]> {
    return this.api.get<PlayerListResponse>(`/players/rarity/${rarity}`)
      .pipe(
        map(response => this.convertApiPlayersToArchetypes(response.players))
      );
  }

  /**
   * Busca um player específico por ID
   */
  getPlayerById(playerId: string): Observable<PlayerArchetype | null> {
    return this.api.get<ApiPlayer>(`/players/${playerId}`)
      .pipe(
        map(apiPlayer => this.convertApiPlayerToArchetype(apiPlayer))
      );
  }

  /**
   * Converte players da API para o formato de arquétipos do frontend
   */
  private convertApiPlayersToArchetypes(apiPlayers: ApiPlayer[]): PlayerArchetype[] {
    return apiPlayers.map(player => this.convertApiPlayerToArchetype(player));
  }

  /**
   * Converte um player da API para arquétipo do frontend
   */
  private convertApiPlayerToArchetype(apiPlayer: ApiPlayer): PlayerArchetype {
    // Mapeia stats do backend para attributes do frontend
    const attributes = this.mapStatsToAttributes(apiPlayer.stats, apiPlayer.rarity);

    // Define cores baseadas na raridade
    const colors = this.getColorsForRarity(apiPlayer.rarity);

    // Define título baseado na especialidade
    const title = this.getTitleFromSpecialAbility(apiPlayer.stats.specialAbility);

    return {
      id: apiPlayer._id,
      name: apiPlayer.name,
      title: title,
      description: apiPlayer.description,
      image: apiPlayer.imageUrl,
      attributes: attributes,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      rarity: apiPlayer.rarity,
      stats: apiPlayer.stats
    };
  }

  /**
   * Mapeia stats da API para attributes do frontend
   * Usa os valores reais da API sem normalização
   */
  private mapStatsToAttributes(stats: any, rarity: string): any {
    // Mapeia diretamente os valores da API para o frontend
    return {
      speed: stats.speed,
      shooting: stats.attack, // attack -> shooting
      passing: Math.round((stats.attack + stats.leadership) / 2), // Média simples
      defense: stats.defense,
      leadership: stats.leadership
    };
  }

  /**
   * Define cores baseadas na raridade
   */
  private getColorsForRarity(rarity: string): { primary: string; secondary: string } {
    switch (rarity) {
      case 'unique':
        return {
          primary: '#7C2C78',
          secondary: '#EB6E19'
        };
      case 'default':
      default:
        return {
          primary: '#1095CF',
          secondary: '#30C9F9'
        };
    }
  }

  /**
   * Define título baseado na habilidade especial
   */
  private getTitleFromSpecialAbility(specialAbility: string): string {
    const titleMap: { [key: string]: string } = {
      'Corrida Relâmpago': 'Velocista Supremo',
      'Passe Mágico': 'Maestro dos Passes',
      'Chute Poderoso': 'Artilheiro Nato',
      'Bloqueio Imbatível': 'Muralha Defensiva',
      'Comando de Equipe': 'Líder Inspirador',

    };

    return titleMap[specialAbility] || 'Guerreiro Urbano';
  }

  /**
   * Fallback com dados mock caso a API não esteja disponível
   */
  private getMockPlayers(): PlayerArchetype[] {
    return [
      {
        id: 'cavaleiro-sombrio',
        name: 'Cavaleiro Sombrio',
        title: 'Assassino das Sombras',
        description: 'Um guerreiro formidável que usa o poder das sombras para dominar o campo.',
        image: 'placeholder-cavaleiro',
        attributes: {
          speed: 75,
          shooting: 85,
          passing: 70,
          defense: 90,
          leadership: 80
        },
        primaryColor: '#8E44AD',
        secondaryColor: '#D35400',
        rarity: 'unique'
      },
      {
        id: 'arqueiro-elfico',
        name: 'Arqueiro Élfico',
        title: 'Atirador de Elite',
        description: 'Mestre em precisão e agilidade, nunca erra o alvo.',
        image: 'placeholder-arqueiro',
        attributes: {
          speed: 90,
          shooting: 95,
          passing: 75,
          defense: 60,
          leadership: 70
        },
        primaryColor: '#27AE60',
        secondaryColor: '#2ECC71',
        rarity: 'unique'
      },
      {
        id: 'paladino-dourado',
        name: 'Paladino Dourado',
        title: 'Guardião Divino',
        description: 'Protetor dos fracos, sua defesa é imbatível.',
        image: 'placeholder-paladino',
        attributes: {
          speed: 60,
          shooting: 70,
          passing: 85,
          defense: 95,
          leadership: 90
        },
        primaryColor: '#F39C12',
        secondaryColor: '#FFE66D',
        rarity: 'default'
      },
      {
        id: 'mago-das-chamas',
        name: 'Mago das Chamas',
        title: 'Mestre das Chamas',
        description: 'Domina o elemento fogo com maestria devastadora.',
        image: 'placeholder-mago',
        attributes: {
          speed: 70,
          shooting: 95,
          passing: 80,
          defense: 45,
          leadership: 75
        },
        primaryColor: '#E74C3C',
        secondaryColor: '#F39C12',
        rarity: 'default'
      },
      {
        id: 'ladino-sombrio',
        name: 'Ladino Sombrio',
        title: 'Sombra Veloz',
        description: 'Rápido e furtivo, ataca quando menos se espera.',
        image: 'placeholder-ladino',
        attributes: {
          speed: 95,
          shooting: 80,
          passing: 70,
          defense: 55,
          leadership: 65
        },
        primaryColor: '#95A5A6',
        secondaryColor: '#34495E',
        rarity: 'default'
      }
    ];
  }

  /**
   * Método com fallback para casos de erro na API
   */
  getPlayersWithFallback(): Observable<PlayerArchetype[]> {
    return this.getAvailablePlayers()
      .pipe(
        map(players => players.length > 0 ? players : this.getMockPlayers())
      );
  }
}
