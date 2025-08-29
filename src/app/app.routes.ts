import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { LoadingScreenComponent } from './pages/loading-screen/loading-screen'; // Importe o novo componente

export const routes: Routes = [
  { path: 'loading', component: LoadingScreenComponent },
  { path: 'login', component: Login },

  // Rota padrão agora aponta para a tela de loading
  { path: '', redirectTo: '/loading', pathMatch: 'full' },

  // Rota de fallback caso o usuário digite uma URL inválida
  { path: '**', redirectTo: '/loading' }
];
