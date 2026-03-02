import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';

/** Use on auth routes (login/register) to redirect authenticated users away. */
export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return of(auth.isAuthenticated()).pipe(
    take(1),
    map((authenticated) => {
      if (!authenticated) return true;
      return router.createUrlTree(['/dashboard']);
    })
  );
};
