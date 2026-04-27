import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  public authService = inject(AuthService);

  profileData = signal<any>(null);
  dashboardStats = signal<any>(null);
  techStack = signal<string[]>([]);
  toastMsg = signal<string | null>(null);

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    bio: [''],
    githubUsername: ['']
  });

  passwordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit() {
    this.loadProfile();
    this.loadStats();
  }

  loadProfile() {
    this.api.get('/profile').subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.profileData.set(data);
        this.profileForm.patchValue({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          bio: data.about || '',
          githubUsername: data.githubUsername || ''
        });
        if (data.skills && Array.isArray(data.skills)) {
          this.techStack.set(data.skills);
        }
      }
    });
  }

  loadStats() {
    this.api.get('/stats/dashboard').subscribe({
      next: (res: any) => {
        this.dashboardStats.set(res.data);
      }
    });
  }

  removeSkill(skill: string) {
    this.techStack.update(skills => skills.filter(s => s !== skill));
  }

  newSkill = '';

  addSkill(event?: any) {
    if (event) event.preventDefault();
    const skill = this.newSkill.trim();
    if (skill) {
      if (!this.techStack().includes(skill)) {
        this.techStack.update(skills => [...skills, skill]);
      }
      this.newSkill = '';
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    this.api.post('/profile/upload', formData).subscribe({
      next: (res: any) => {
        this.showToast('Photo uploaded successfully!');
        this.profileData.update(data => ({ ...data, photoUrl: res.data.photoUrl }));
      },
      error: () => this.showToast('Failed to upload photo.')
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    
    const payload = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      about: this.profileForm.value.bio,
      githubUsername: this.profileForm.value.githubUsername,
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
