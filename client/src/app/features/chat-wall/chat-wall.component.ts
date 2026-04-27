import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface WallMessageUser {
  _id: string;
  firstName: string;
  lastName?: string;
}

interface WallMessage {
  _id: string;
  text: string;
  createdAt: string;
  userId: WallMessageUser;
}

@Component({
  selector: 'app-chat-wall',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './chat-wall.component.html'
})
export class ChatWallComponent implements OnInit {
  private api = inject(ApiService);
  private socketService = inject(SocketService);

  messages = signal<WallMessage[]>([]);
  isLoading = signal<boolean>(true);
  isPosting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  draft = '';

  ngOnInit(): void {
    this.fetchWallMessages(true);
    
    // Listen for new wall messages
    this.socketService.listenWallMessages((message: any) => {
      this.messages.update(msgs => [message, ...msgs]);
    });
  }

  postToWall(): void {
    const text = this.draft.trim();
    if (!text || this.isPosting()) {
      return;
    }

    this.isPosting.set(true);
    this.errorMessage.set(null);

    this.api.post<ApiResponse<WallMessage>>('/chat/wall', { text }).subscribe({
      next: (res: any) => {
        this.draft = '';
        // Emit the message via socket so others see it instantly
        this.socketService.emitWallMessage(res.data);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Failed to post to the chat wall');
        this.isPosting.set(false);
      },
      complete: () => {
        this.isPosting.set(false);
      }
    });
  }

  private fetchWallMessages(showLoader: boolean): void {
    if (showLoader) {
      this.isLoading.set(true);
    }

    this.api.get<ApiResponse<WallMessage[]>>('/chat/wall', { limit: 100 }).subscribe({
      next: (response) => {
        const responseData = response?.data;
        this.messages.set(Array.isArray(responseData) ? responseData : []);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Failed to load chat wall');
      },
      complete: () => {
        if (showLoader) {
          this.isLoading.set(false);
        }
      }
    });
  }
}
