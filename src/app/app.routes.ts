import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { LoadingScreen } from './pages/loading/loading-screen';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'loading', component: LoadingScreen },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },

  // Rota protegida - só acessível com token válido
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  // Rota padrão agora aponta para a tela de loading
  { path: '', redirectTo: '/loading', pathMatch: 'full' },

  // Rota de fallback caso o usuário digite uma URL inválida
  { path: '**', redirectTo: '/loading' }
];
