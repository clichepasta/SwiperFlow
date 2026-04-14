import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMsg = signal<string | null>(null);
  submitting = signal<boolean>(false);

  loginForm = this.fb.group({
    emailId: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.submitting.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || 'Login failed. Please verify credentials.');
      }
    });
  }
}
