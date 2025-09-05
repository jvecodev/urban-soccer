import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  console.log('Auth Guard executado para rota:', state.url);

  const isAuthenticated = authService.isAuthenticated();
  console.log('Usuário autenticado:', isAuthenticated);

  if (isAuthenticated) {
    console.log('Acesso permitido à rota protegida');
    return true;
  } else {
    console.log('Acesso negado - redirecionando para login');
    router.navigate(['/login']);
    return false;
  }
};
