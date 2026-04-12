import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  
  public user = signal<any>(null);
  public isInitialized = signal<boolean>(false);

  checkAuth() {
    return this.api.get('/profile').pipe(
      tap((res: any) => {
        this.user.set(res.data || res);
        this.isInitialized.set(true);
      }),
      catchError((err) => {
        this.user.set(null);
        this.isInitialized.set(true);
        return of(null);
      })
    );
  }

  login(credentials: any) {
    return this.api.post('/login', credentials).pipe(
      tap((res: any) => {
        if (res) this.user.set(res.data || res);
      })
    );
  }

  signup(credentials: any) {
    return this.api.post('/signup', credentials).pipe(
      tap((res: any) => {
        if (res) this.user.set(res.data || res);
      })
    );
  }

  logout() {
    return this.api.post('/logout', {}).pipe(
      tap(() => {
        this.user.set(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }
}
