import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationData, DetailSection } from '../../interfaces/common.interface';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirmation-overlay" *ngIf="isVisible()" (click)="onOverlayClick($event)">
      <div class="confirmation-card" (click)="$event.stopPropagation()">
        <h3 class="confirmation-title">{{ data().title }}</h3>

        <p class="confirmation-message" *ngIf="data().message">
          {{ data().message }}
        </p>

        <!-- Dynamic content sections -->
        <div class="confirmation-content" *ngIf="sections().length > 0">
          <div *ngFor="let section of sections()" class="detail-section">
            <div class="section-title" *ngIf="section.title">
              <span *ngIf="section.icon" class="section-icon">{{ section.icon }}</span>
              {{ section.title }}
            </div>

            <div class="detail-items">
              <div *ngFor="let item of section.items" class="detail-row">
                <span class="detail-label">{{ item.label }}:</span>
                <span class="detail-value">
                  <span *ngIf="item.icon" class="detail-icon">{{ item.icon }}</span>
                  {{ item.value }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="confirmation-actions">
          <button
            type="button"
            class="btn-confirm"
            (click)="onConfirm()">
            {{ confirmIcon() }} {{ confirmText() }}
          </button>

          <button
            type="button"
            class="btn-cancel"
            (click)="onCancel()">
            {{ cancelIcon() }} {{ cancelText() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-in-out;
    }

    .confirmation-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: scale(0.9) translateY(-20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .confirmation-title {
      color: #333;
      margin-bottom: 15px;
      text-align: center;
      font-size: 1.5em;
    }

    .confirmation-message {
      color: #666;
      margin-bottom: 20px;
      text-align: center;
      font-size: 1.1em;
    }

    .confirmation-content {
      margin-bottom: 25px;
    }

    .detail-section {
      margin-bottom: 20px;
    }

    .section-title {
      color: #495057;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #fd7e14;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-icon {
      font-size: 1.2em;
    }

    .detail-items {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 500;
      color: #495057;
      flex: 0 0 auto;
    }

    .detail-value {
      font-weight: 600;
      color: #212529;
      text-align: right;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .detail-icon {
      font-size: 0.9em;
    }

    .confirmation-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .btn-confirm,
    .btn-cancel {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
    }

    .btn-confirm {
      background: #28a745;
      color: white;
    }

    .btn-confirm:hover {
      background: #218838;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .btn-cancel {
      background: #dc3545;
      color: white;
    }

    .btn-cancel:hover {
      background: #c82333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }

    .btn-confirm:active,
    .btn-cancel:active {
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .confirmation-card {
        width: 95%;
        padding: 20px;
      }

      .confirmation-actions {
        flex-direction: column;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .detail-value {
        text-align: left;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  // Inputs using new signal-based API
  data = input.required<ConfirmationData>();
  sections = input<DetailSection[]>([]);
  isVisible = input<boolean>(false);

  // Outputs using new signal-based API
  confirmed = output<void>();
  cancelled = output<void>();

  // Computed properties for button text and icons
  confirmText = computed(() => this.data().confirmText || 'Confirmar');
  cancelText = computed(() => this.data().cancelText || 'Cancelar');
  confirmIcon = computed(() => this.data().confirmIcon || '✅');
  cancelIcon = computed(() => this.data().cancelIcon || '❌');

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(event: Event): void {
    // Close dialog when clicking on overlay (background)
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
