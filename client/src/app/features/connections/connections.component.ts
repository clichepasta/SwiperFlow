import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connections.component.html'
})
export class ConnectionsComponent implements OnInit {
  private api = inject(ApiService);
  
  connections = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.api.get('/user/connections').subscribe({
      next: (res: any) => {
        this.connections.set(res.data || res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
