import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html'
})
export class FeedComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  
  feedQueue = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  genderFilter = signal<string>('');
  skillFilter = signal<string>('');
  showFilters = signal<boolean>(false);
  currentPage = 1;
  hasMore = true;

  ngOnInit() {
    this.loadFeed();
  }

  applyFilters() {
    this.feedQueue.set([]);
    this.currentPage = 1;
    this.hasMore = true;
    this.loadFeed();
  }

  loadFeed() {
    if (!this.hasMore) return;
    this.isLoading.set(true);

    let url = `/user/feed?page=${this.currentPage}&limit=10`;
    if (this.genderFilter()) url += `&gender=${this.genderFilter()}`;
    if (this.skillFilter()) url += `&skills=${this.skillFilter()}`;

    this.api.get(url).subscribe({
      next: (res: any) => {
        const users = res.data || res;
        if (users.length < 10) {
          this.hasMore = false;
        }
        this.feedQueue.update(q => [...q, ...users]);
        this.isLoading.set(false);
        this.currentPage++;
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getSimilarityScore(targetSkills: string[]): number {
    const mySkills = this.authService.user()?.skills || [];
    if (!mySkills.length || !targetSkills.length) return 0;
    
    const intersection = mySkills.filter((s: string) => 
      targetSkills.some(ts => ts.toLowerCase() === s.toLowerCase())
    );
    
    // Weighted formula: (matches / (total unique skills across both))
    const totalUnique = new Set([...mySkills.map((s: string) => s.toLowerCase()), ...targetSkills.map(s => s.toLowerCase())]).size;
    return Math.round((intersection.length / totalUnique) * 100);
  }

  swipe(action: 'interested' | 'ignore') {
    const queue = this.feedQueue();
    if (queue.length === 0) return;

    const targetUser = queue[0];
    // Optimistically remove from UI
    this.feedQueue.update(q => q.slice(1));

    // Refill queue if running low
    if (this.feedQueue().length < 3) {
      this.loadFeed();
    }

    this.api.post(`/request/send/${action}/${targetUser._id}`, {}).subscribe({
      error: (err) => {
        console.error('Failed to send request', err);
      }
    });
  }
}
