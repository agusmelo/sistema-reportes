import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-processing-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="processing-container" *ngIf="steps().length > 0">
      <h4 class="processing-title">
        <span class="processing-icon">⚙️</span>
        {{ title() }}
      </h4>
      
      <ul class="processing-list">
        <li 
          *ngFor="let step of steps(); let i = index; let last = last"
          class="processing-step"
          [class.step-completed]="i < steps().length - 1"
          [class.step-current]="last"
          [style.animation-delay]="i * 200 + 'ms'">
          
          <span class="step-icon">
            <span *ngIf="i < steps().length - 1" class="icon-completed">✅</span>
            <span *ngIf="last" class="icon-current">⚡</span>
          </span>
          
          <span class="step-text">{{ step }}</span>
        </li>
      </ul>
      
      <div class="processing-indicator" *ngIf="showProgress()">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            [style.width.%]="progressPercentage()">
          </div>
        </div>
        <span class="progress-text">{{ progressText() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .processing-container {
      background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
      border: 1px solid #90caf9;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
    }

    .processing-title {
      color: #1976d2;
      margin: 0 0 15px 0;
      font-size: 1.1em;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .processing-icon {
      animation: rotate 2s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .processing-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .processing-step {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-radius: 6px;
      margin-bottom: 5px;
      transition: all 0.3s ease;
      animation: slideInLeft 0.5s ease-out;
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .step-icon {
      font-size: 1rem;
      width: 20px;
      display: flex;
      justify-content: center;
    }

    .icon-completed {
      color: #4caf50;
    }

    .icon-current {
      color: #ff9800;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.1);
      }
    }

    .step-text {
      color: #424242;
      font-weight: 500;
      line-height: 1.4;
    }

    .step-completed .step-text {
      color: #2e7d32;
    }

    .step-current {
      background: rgba(255, 152, 0, 0.1);
      padding-left: 8px;
      border-left: 3px solid #ff9800;
    }

    .step-current .step-text {
      color: #e65100;
      font-weight: 600;
    }

    .processing-indicator {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e1f5fe;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e3f2fd;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #2196f3, #03a9f4);
      border-radius: 3px;
      transition: width 0.3s ease;
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -100% 0;
      }
      100% {
        background-position: 100% 0;
      }
    }

    .progress-text {
      font-size: 0.875rem;
      color: #1976d2;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .processing-container {
        padding: 15px;
        margin: 10px 0;
      }

      .processing-step {
        padding: 6px 0;
      }

      .step-text {
        font-size: 0.9rem;
      }
    }
  `]
})
export class ProcessingStepsComponent {
  steps = input<string[]>([]);
  title = input<string>('Procesando...');
  showProgress = input<boolean>(true);
  
  progressPercentage(): number {
    const total = this.steps().length;
    if (total === 0) return 0;
    
    // Show progress based on completed steps (all but the last one)
    const completed = Math.max(0, total - 1);
    return Math.round((completed / total) * 100);
  }
  
  progressText(): string {
    const total = this.steps().length;
    const completed = Math.max(0, total - 1);
    return `${completed}/${total} pasos completados`;
  }
}
