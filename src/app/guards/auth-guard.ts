import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';


/**
 *
 * @param route
 * @param state
 * @returns boolean - Retorna true se o usuário está autenticado, caso contrário redireciona para a página de login
 */

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return true;
  } else {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }
};
