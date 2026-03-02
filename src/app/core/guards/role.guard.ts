import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';
import type { UserRole } from '../models/user.model';

export function roleGuard(allowedRoles: UserRole[]): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return of(auth.hasRole(allowedRoles)).pipe(
      take(1),
      map((allowed) => {
        if (allowed) return true;
        return router.createUrlTree(['/']);
      })
    );
  };
}
