import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, filter } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const initObs = toObservable(authService.isInitialized);
  
  return initObs.pipe(
    filter(isInit => isInit),
    map(() => {
      if (authService.user()) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
};
