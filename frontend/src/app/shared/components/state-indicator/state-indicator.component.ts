import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateIndicatorInfo } from '../../interfaces/common.interface';

@Component({
  selector: 'app-state-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="state-indicator" *ngIf="stateInfo() && stateInfo()!.state !== 'checking'">
      <div
        class="state-badge"
        [class]="getBadgeClasses()"
        [style.background-color]="getStateColor()">
        <span class="state-icon">{{ getStateIcon() }}</span>
        <span class="state-message">{{ stateInfo()!.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .state-indicator {
      margin: 15px 0;
      display: flex;
      justify-content: center;
    }

    .state-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: 25px;
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      min-width: 200px;
      justify-content: center;
      animation: slideInScale 0.4s ease-out;
    }

    @keyframes slideInScale {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .state-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .state-icon {
      font-size: 1.2em;
      display: flex;
      align-items: center;
    }

    .state-message {
      text-align: center;
      line-height: 1.3;
    }

    /* State-specific styles */
    .badge-green {
      background: linear-gradient(135deg, #28a745, #20c997) !important;
    }

    .badge-yellow {
      background: linear-gradient(135deg, #ffc107, #fd7e14) !important;
      color: #212529 !important;
    }

    .badge-orange {
      background: linear-gradient(135deg, #fd7e14, #dc3545) !important;
    }

    .badge-disabled {
      background: linear-gradient(135deg, #6c757d, #495057) !important;
    }

    .badge-checking {
      background: linear-gradient(135deg, #17a2b8, #6610f2) !important;
      animation: checkingPulse 2s infinite;
    }

    @keyframes checkingPulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.02);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .state-badge {
        padding: 10px 16px;
        font-size: 0.875rem;
        min-width: 180px;
        flex-direction: column;
        gap: 5px;
        text-align: center;
      }

      .state-icon {
        font-size: 1.5em;
      }
    }

    @media (max-width: 480px) {
      .state-badge {
        padding: 8px 12px;
        font-size: 0.8rem;
        min-width: 150px;
      }
    }
  `]
})
export class StateIndicatorComponent {
  stateInfo = input<StateIndicatorInfo | null>(null);

  getBadgeClasses(): string {
    const state = this.stateInfo()?.state;
    return `state-badge badge-${state}`;
  }

  getStateColor(): string {
    const info = this.stateInfo();
    if (!info) return '#007bff';

    // Use custom color if provided
    if (info.color) {
      return info.color;
    }

    // Default colors based on state
    switch (info.state) {
      case 'green':
        return '#28a745';
      case 'yellow':
        return '#ffc107';
      case 'orange':
        return '#fd7e14';
      case 'disabled':
        return '#6c757d';
      case 'checking':
        return '#17a2b8';
      default:
        return '#007bff';
    }
  }

  getStateIcon(): string {
    const info = this.stateInfo();
    if (!info) return '🔄';

    // Use custom icon if provided
    if (info.icon) {
      return info.icon;
    }

    // Default icons based on state
    switch (info.state) {
      case 'green':
        return '✅';
      case 'yellow':
        return '⚠️';
      case 'orange':
        return '🟠';
      case 'disabled':
        return '❌';
      case 'checking':
        return '🔄';
      default:
        return '🔄';
    }
  }
}
