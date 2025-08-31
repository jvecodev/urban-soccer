import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { LoadingScreen } from './pages/loading/loading-screen';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: 'loading', component: LoadingScreen },
  { path: 'home', component: Home },
  { path: 'login', component: Login },

  // Rota padrão agora aponta para a tela de loading
  { path: '', redirectTo: '/loading', pathMatch: 'full' },

  // Rota de fallback caso o usuário digite uma URL inválida
  { path: '**', redirectTo: '/loading' }
];
