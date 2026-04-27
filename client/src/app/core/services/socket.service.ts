import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      withCredentials: true
    });
  }

  getSocket() {
    return this.socket;
  }

  joinChat(data: { firstName: string; userId: string; targetUserId: string }) {
    this.socket.emit('joinChat', data);
  }

  sendMessage(data: { firstName: string; lastName?: string; userId: string; targetUserId: string; text: string }) {
    this.socket.emit('sendMessage', data);
  }

  sendTyping(data: { userId: string; targetUserId: string; firstName: string }) {
    this.socket.emit('typing', data);
  }

  sendStopTyping(data: { userId: string; targetUserId: string }) {
    this.socket.emit('stopTyping', data);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket.on('userTyping', callback);
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    this.socket.on('userStoppedTyping', callback);
  }

  listenWallMessages(callback: (message: any) => void) {
    this.socket.on('newWallMessage', callback);
  }

  emitWallMessage(message: any) {
    this.socket.emit('wallMessage', message);
  }

  onMessageReceived() {
    return new Promise((resolve) => {
      this.socket.on('messageReceived', (message) => {
        resolve(message);
      });
    });
  }
  
  // Alternative with callback for continuous listening
  listenMessages(callback: (message: any) => void) {
    this.socket.on('messageReceived', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
