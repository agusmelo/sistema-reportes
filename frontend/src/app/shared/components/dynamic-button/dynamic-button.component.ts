import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonState } from '../../interfaces/common.interface';

@Component({
  selector: 'app-dynamic-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      type="button"
      class="btn-dynamic"
      [class]="buttonClasses()"
      [style.background-color]="buttonState().color"
      [disabled]="buttonState().disabled"
      (click)="onClick()">
      <span class="btn-content">
        <span class="btn-icon">{{ buttonState().icon }}</span>
        <span class="btn-text">{{ buttonState().text }}</span>
      </span>
    </button>
  `,
  styles: [`
    .btn-dynamic {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
      font-size: 1rem;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .btn-dynamic:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-dynamic:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .btn-dynamic:not(:disabled):active {
      transform: translateY(0);
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-icon {
      font-size: 1.2em;
      display: flex;
      align-items: center;
    }

    .btn-text {
      font-weight: 600;
    }

    /* State-specific styles */
    .btn-green {
      background: linear-gradient(135deg, #28a745, #20c997);
    }

    .btn-green:not(:disabled):hover {
      background: linear-gradient(135deg, #218838, #1a9c83);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .btn-yellow {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
      color: #212529;
    }

    .btn-yellow:not(:disabled):hover {
      background: linear-gradient(135deg, #e0a800, #e8681d);
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
    }

    .btn-orange {
      background: linear-gradient(135deg, #fd7e14, #dc3545);
    }

    .btn-orange:not(:disabled):hover {
      background: linear-gradient(135deg, #e8681d, #c82333);
      box-shadow: 0 4px 12px rgba(253, 126, 20, 0.3);
    }

    .btn-disabled {
      background: #6c757d;
    }

    .btn-processing {
      background: linear-gradient(135deg, #007bff, #6610f2);
      animation: processingPulse 2s infinite;
    }

    .btn-checking {
      background: linear-gradient(135deg, #17a2b8, #6f42c1);
      animation: checkingSpinner 1s linear infinite;
    }

    @keyframes processingPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes checkingSpinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Size variants */
    .btn-small {
      padding: 8px 16px;
      font-size: 0.875rem;
      min-width: 120px;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 1.125rem;
      min-width: 250px;
    }

    @media (max-width: 768px) {
      .btn-dynamic {
        width: 100%;
        min-width: unset;
      }
    }
  `]
})
export class DynamicButtonComponent {
  // Inputs
  buttonState = input.required<ButtonState>();
  size = input<'small' | 'medium' | 'large'>('medium');
  type = input<'button' | 'submit'>('button');

  // Computed classes based on state and size
  buttonClasses = computed(() => {
    const state = this.buttonState().state;
    const size = this.size();
    
    let classes = 'btn-dynamic';
    
    // Add state class
    switch (state) {
      case 'green':
        classes += ' btn-green';
        break;
      case 'yellow':
        classes += ' btn-yellow';
        break;
      case 'orange':
        classes += ' btn-orange';
        break;
      case 'disabled':
        classes += ' btn-disabled';
        break;
      case 'processing':
        classes += ' btn-processing';
        break;
      case 'checking':
        classes += ' btn-checking';
        break;
    }
    
    // Add size class
    if (size !== 'medium') {
      classes += ` btn-${size}`;
    }
    
    return classes;
  });

  onClick(): void {
    // Only emit if not disabled
    if (!this.buttonState().disabled) {
      // This component is just for display, the parent handles the logic
    }
  }
}
