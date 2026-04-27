import { Injectable, inject, signal } from '@angular/core';
import { SocketService } from './socket.service';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'match' | 'info';
  targetUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socketService = inject(SocketService);
  
  notifications = signal<AppNotification[]>([]);

  constructor() {
    this.listenToSocket();
  }

  private listenToSocket() {
    this.socketService.listenMessages((message: any) => {
      // Logic to show notification if we are not on the chat page with this person
      // This part is a bit tricky because the service doesn't know the current route easily
      // But we can just push it and the UI will decide
      this.addNotification({
        id: Math.random().toString(36).substring(7),
        title: `New message from ${message.firstName}`,
        message: message.text,
        type: 'message',
        targetUrl: `/chat?userId=${message.senderId}`
      });
    });
  }

  addNotification(notification: AppNotification) {
    this.notifications.update(n => [...n, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: string) {
    this.notifications.update(n => n.filter(item => item.id !== id));
  }
}
