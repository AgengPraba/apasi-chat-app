import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

// Helper function to check authentication
const checkAuth = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    const user = await authService.checkAuth();
    console.log(user);

    if (user) {
      return true;
    } else {
      router.navigateByUrl('/login', { replaceUrl: true });
      return false;
    }
  } catch (e) {
    console.log(e);
    router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }
};

// CanActivate Guard
export const authGuard: CanActivateFn = async (route, state) => {
  return await checkAuth();
};

// CanMatch Guard
export const authMatchGuard: CanMatchFn = async (route, state) => {
  return await checkAuth();
};
