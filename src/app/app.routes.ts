import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { LoadingScreen } from './pages/loading/loading-screen';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { PlayerSelection } from './pages/player-selection/player-selection';
import { MyCharacters } from './pages/my-characters/my-characters';
import { CampaignSelection } from './pages/campaign-selection/campaign-selection';
import { MyCampaigns } from './pages/my-campaigns/my-campaigns';
import { GameStart } from './pages/game-start/game-start';
import { Faq } from './pages/faq/faq';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'loading', component: LoadingScreen },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },

  {
    path: 'player-selection',
    component: PlayerSelection,
    canActivate: [authGuard]
  },

  {
    path: 'my-characters',
    component: MyCharacters,
    canActivate: [authGuard]
  },

  {
    path: 'campaign-selection',
    component: CampaignSelection,
    canActivate: [authGuard]
  },

  {
    path: 'my-campaigns',
    component: MyCampaigns,
    canActivate: [authGuard]
  },

  {
    path: 'game-start',
    component: GameStart,
    canActivate: [authGuard]
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  {
    path: 'faq',
    component: Faq,
    canActivate: [authGuard]
  },

  // Rota padrão agora aponta para a tela de loading
  { path: '', redirectTo: '/loading', pathMatch: 'full' },

  // Rota de fallback caso o usuário digite uma URL inválida
  { path: '**', redirectTo: '/loading' }
];
