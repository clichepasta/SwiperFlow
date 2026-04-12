import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests.component.html'
})
export class RequestsComponent implements OnInit {
  private api = inject(ApiService);
  
  requestsQueue = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.api.get('/user/request/received').subscribe({
      next: (res: any) => {
        this.requestsQueue.set(res.data || res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  reviewRequest(requestId: string, status: 'accepted' | 'rejected') {
    // Optimistic UI Removal
    this.requestsQueue.update(requests => requests.filter(r => r._id !== requestId));

    this.api.post(`/request/review/${status}/${requestId}`, {}).subscribe({
      error: (err) => {
        console.error('Failed to review request', err);
        // Could rollback UI change here if desired
      }
    });
  }
}
