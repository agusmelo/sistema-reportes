import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessage } from '../../interfaces/common.interface';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="message()"
      class="validation-message"
      [class]="messageClasses()">
      <span class="message-icon" *ngIf="displayIcon()">{{ displayIcon() }}</span>
      <span class="message-text">{{ message()!.message }}</span>
    </div>
  `,
  styles: [`
    .validation-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-top: 5px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .message-text {
      line-height: 1.4;
    }

    /* Message type styles */
    .message-error {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .message-warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
    }

    .message-info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }

    .message-success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    /* Special animations for warnings */
    .message-warning {
      animation: warningPulse 2s infinite;
    }

    @keyframes warningPulse {
      0%, 100% {
        box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
      }
      50% {
        box-shadow: 0 0 12px rgba(255, 193, 7, 0.6);
      }
    }

    @media (max-width: 768px) {
      .validation-message {
        font-size: 0.8rem;
        padding: 8px 10px;
      }
    }
  `]
})
export class ValidationMessageComponent {
  message = input<ValidationMessage | null>(null);

  // Computed properties for CSS classes and icons
  messageClasses(): string {
    if (!this.message()) return '';

    const type = this.message()!.type;
    return `validation-message message-${type}`;
  }

  displayIcon(): string {
    if (!this.message()) return '';

    const msg = this.message()!;

    // Use custom icon if provided, otherwise default based on type
    if (msg.icon) {
      return msg.icon;
    }

    switch (msg.type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '';
    }
  }
}
