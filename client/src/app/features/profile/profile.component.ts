import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  public authService = inject(AuthService);

  profileData = signal<any>(null);
  techStack = signal<string[]>([]);
  toastMsg = signal<string | null>(null);

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    bio: ['']
  });

  passwordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit() {
    this.api.get('/profile').subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.profileData.set(data);
        this.profileForm.patchValue({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          bio: data.bio || ''
        });
        if (data.skills && Array.isArray(data.skills)) {
          this.techStack.set(data.skills);
        }
      }
    });
  }

  removeSkill(skill: string) {
    this.techStack.update(skills => skills.filter(s => s !== skill));
  }

  addSkill() {
    const skill = prompt('Enter a new technology/skill:');
    if (skill && skill.trim()) {
      this.techStack.update(skills => [...skills, skill.trim()]);
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    
    const payload = {
      ...this.profileForm.value,
      skills: this.techStack()
    };

    this.api.patch('/profile/edit', payload).subscribe({
      next: () => this.showToast('Profile updated successfully!'),
      error: () => this.showToast('Failed to update profile.')
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    const { password, confirmPassword } = this.passwordForm.value;
    
    if (password !== confirmPassword) {
      this.showToast('Passwords do not match.');
      return;
    }

    this.api.patch('/profile/password', { password }).subscribe({
      next: () => {
        this.showToast('Password changed successfully!');
        this.passwordForm.reset();
      },
      error: () => this.showToast('Failed to change password.')
    });
  }

  private showToast(msg: string) {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(null), 3000);
  }
}
