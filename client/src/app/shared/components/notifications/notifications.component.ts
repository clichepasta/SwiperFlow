import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      @for (n of notificationService.notifications(); track n.id) {
        <div 
          class="pointer-events-auto bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl p-4 w-72 transform transition-all animate-slide-in flex gap-3 items-start"
          [routerLink]="n.targetUrl"
          (click)="notificationService.removeNotification(n.id)"
        >
          <div class="bg-primary/10 p-2 rounded-xl text-primary">
            <span class="material-symbols-outlined text-[20px]">
              {{ n.type === 'message' ? 'chat' : 'favorite' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-on-surface truncate">{{ n.title }}</p>
            <p class="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">{{ n.message }}</p>
          </div>
          <button (click)="$event.stopPropagation(); notificationService.removeNotification(n.id)" class="text-on-surface-variant hover:text-error transition-colors">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);
}
