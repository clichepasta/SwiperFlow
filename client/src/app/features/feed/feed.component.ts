import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed.component.html'
})
export class FeedComponent implements OnInit {
  private api = inject(ApiService);
  
  feedQueue = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = 1;
  hasMore = true;

  ngOnInit() {
    this.loadFeed();
  }

  loadFeed() {
    if (!this.hasMore) return;
    this.isLoading.set(true);

    this.api.get(`/user/feed?page=${this.currentPage}&limit=10`).subscribe({
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
