import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface UserSummary {
  _id: string;
  firstName: string;
  lastName?: string;
  about?: string;
  skills?: string[];
}

interface ConnectionRecord {
  _id: string;
  fromUserId: UserSummary;
  toUserId: UserSummary;
}

interface ChatConnection extends UserSummary {
  connectionRequestId: string;
}

interface DirectMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);
  private route = inject(ActivatedRoute);

  connections = signal<ChatConnection[]>([]);
  messages = signal<DirectMessage[]>([]);
  selectedConnectionId = signal<string | null>(null);
  isLoadingConnections = signal<boolean>(true);
  isLoadingMessages = signal<boolean>(false);
  isSending = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  newMessage = '';
  isPeerTyping = signal<boolean>(false);
  private typingTimeout: any;

  private requestedUserId: string | null = null;
  private queryParamSub?: Subscription;

  readonly selectedConnection = computed(() => {
    const selectedId = this.selectedConnectionId();
    if (!selectedId) {
      return null;
    }
    return this.connections().find((connection) => connection._id === selectedId) || null;
  });

  ngOnInit(): void {
    this.requestedUserId = this.route.snapshot.queryParamMap.get('userId');

    this.queryParamSub = this.route.queryParamMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId) {
        this.requestedUserId = userId;
        this.trySelectRequestedConnection();
      }
    });

    this.loadConnections();
    
    // Listen for incoming messages
    this.socketService.listenMessages((message: any) => {
      const currentId = this.currentUserId();
      const targetId = this.selectedConnectionId();
      
      if (
        (message.senderId === targetId && message.receiverId === currentId) ||
        (message.senderId === currentId && message.receiverId === targetId)
      ) {
        this.messages.update(msgs => [...msgs, message]);
      }
    });

    // Listen for typing status
    this.socketService.onUserTyping((data: any) => {
      const incomingId = String(data.userId);
      const currentSelectedId = String(this.selectedConnectionId());
      
      if (incomingId === currentSelectedId) {
        this.isPeerTyping.set(true);
      }
    });

    this.socketService.onUserStoppedTyping((data: any) => {
      const incomingId = String(data.userId);
      const currentSelectedId = String(this.selectedConnectionId());

      if (incomingId === currentSelectedId) {
        this.isPeerTyping.set(false);
      }
    });
  }

  onTyping() {
    const targetUserId = this.selectedConnectionId();
    if (!targetUserId) return;

    this.socketService.sendTyping({
      userId: this.currentUserId(),
      targetUserId,
      firstName: this.authService.user()?.firstName
    });

    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.socketService.sendStopTyping({
        userId: this.currentUserId(),
        targetUserId
      });
    }, 2000);
  }

  ngOnDestroy(): void {
    this.queryParamSub?.unsubscribe();
  }

  currentUserId(): string {
    return this.authService.user()?._id || '';
  }

  isOwnMessage(message: DirectMessage): boolean {
    return message.senderId === this.currentUserId();
  }

  selectConnection(userId: string): void {
    if (this.selectedConnectionId() === userId) {
      return;
    }
    this.selectedConnectionId.set(userId);
    this.messages.set([]);
    
    // Join socket room
    this.socketService.joinChat({
      firstName: this.authService.user()?.firstName || 'User',
      userId: this.currentUserId(),
      targetUserId: userId
    });

    this.fetchMessages(true);
  }

  sendMessage(): void {
    const targetUserId = this.selectedConnectionId();
    const text = this.newMessage.trim();

    if (!targetUserId || !text || this.isSending()) {
      return;
    }

    this.isSending.set(true);
    this.errorMessage.set(null);

    // 1. Save to database via REST
    this.api.post<ApiResponse<DirectMessage>>(`/chat/conversation/${targetUserId}`, { text }).subscribe({
      next: (res: any) => {
        this.newMessage = '';
        const savedMessage = res.data;
        
        // 2. Emit via socket for real-time delivery
        this.socketService.sendMessage({
          firstName: this.authService.user()?.firstName,
          lastName: this.authService.user()?.lastName,
          userId: this.currentUserId(),
          targetUserId: targetUserId,
          text: savedMessage.text
        });

        // 3. Update local UI if not already added by socket listener
        // (The listener might catch its own emit depending on server implementation, 
        // but our server emits to room which includes sender)
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Failed to send message');
        this.isSending.set(false);
      },
      complete: () => {
        this.isSending.set(false);
      }
    });
  }

  private loadConnections(): void {
    this.isLoadingConnections.set(true);
    this.errorMessage.set(null);

    this.api.get<ApiResponse<ConnectionRecord[]>>('/user/connections').subscribe({
      next: (response) => {
        const responseData = response?.data;
        const records = Array.isArray(responseData) ? responseData : [];
        const loggedInUserId = this.currentUserId();

        const mappedConnections = records
          .map((record) => this.mapConnection(record, loggedInUserId))
          .filter((connection): connection is ChatConnection => !!connection);

        this.connections.set(mappedConnections);

        if (!this.trySelectRequestedConnection() && !this.selectedConnectionId() && mappedConnections.length > 0) {
          this.selectConnection(mappedConnections[0]._id);
        }
      },
      error: () => {
        this.errorMessage.set('Failed to load connections');
      },
      complete: () => {
        this.isLoadingConnections.set(false);
      }
    });
  }

  private mapConnection(record: ConnectionRecord, loggedInUserId: string): ChatConnection | null {
    if (!record?.fromUserId?._id || !record?.toUserId?._id) {
      return null;
    }

    const fromId = String(record.fromUserId._id);
    const myId = String(loggedInUserId);

    const peer = fromId === myId ? record.toUserId : record.fromUserId;

    return {
      ...peer,
      connectionRequestId: record._id
    };
  }

  private trySelectRequestedConnection(): boolean {
    if (!this.requestedUserId) {
      return false;
    }

    const requestedConnection = this.connections().find((connection) => connection._id === this.requestedUserId);
    if (!requestedConnection) {
      return false;
    }

    this.selectConnection(requestedConnection._id);
    this.requestedUserId = null;
    return true;
  }

  private fetchMessages(showLoader: boolean): void {
    const targetUserId = this.selectedConnectionId();
    if (!targetUserId) {
      return;
    }

    if (showLoader) {
      this.isLoadingMessages.set(true);
    }

    this.api.get<ApiResponse<DirectMessage[]>>(`/chat/conversation/${targetUserId}`, { limit: 100 }).subscribe({
      next: (response) => {
        const responseData = response?.data;
        this.messages.set(Array.isArray(responseData) ? responseData : []);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Failed to load messages');
      },
      complete: () => {
        if (showLoader) {
          this.isLoadingMessages.set(false);
        }
      }
    });
  }
}
