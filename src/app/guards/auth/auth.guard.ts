import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

const checkAuth = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    console.log('Guard: Checking authentication');
    const user = await authService.checkAuth();

    console.log('Guard: Authentication result', user);

    if (user) {
      console.log('Guard: User authenticated');
      return true;
    } else {
      console.log('Guard: No user, redirecting to login');
      router.navigateByUrl('/login', {
        replaceUrl: true,
      });
      return false;
    }
  } catch (e) {
    console.error('Guard: Authentication error', e);
    router.navigateByUrl('/login', {
      replaceUrl: true,
    });
    return false;
  }
};

export const authGuard: CanActivateFn = async (route, state) => {
  return await checkAuth();
};

export const authMatchGuard: CanMatchFn = async (route, state) => {
  return await checkAuth();
};
