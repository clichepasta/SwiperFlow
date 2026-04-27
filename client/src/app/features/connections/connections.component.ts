import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface UserSummary {
  _id: string;
  firstName: string;
  lastName?: string;
  about?: string;
  skills?: string[];
  photoUrl?: string;
}

interface ConnectionRecord {
  _id: string;
  fromUserId: UserSummary;
  toUserId: UserSummary;
}

interface ConnectedUser extends UserSummary {
  connectionRequestId: string;
}

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './connections.component.html'
})
export class ConnectionsComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  connections = signal<ConnectedUser[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.api.get('/user/connections').subscribe({
      next: (res: any) => {
        const records = Array.isArray(res?.data) ? res.data : [];
        const loggedInUserId = this.authService.user()?._id;
        
        const mappedConnections = records
          .map((record: ConnectionRecord) => this.mapConnection(record, loggedInUserId))
          .filter((connection: ConnectedUser | null): connection is ConnectedUser => !!connection);

        this.connections.set(mappedConnections);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private mapConnection(record: ConnectionRecord, loggedInUserId?: string): ConnectedUser | null {
    if (!record?.fromUserId?._id || !record?.toUserId?._id || !loggedInUserId) {
      return null;
    }

    const fromId = String(record.fromUserId._id);
    const toId = String(record.toUserId._id);
    const currentId = String(loggedInUserId);

    const peerUser = fromId === currentId ? record.toUserId : record.fromUserId;
    
    return {
      ...peerUser,
      connectionRequestId: record._id
    };
  }
}
