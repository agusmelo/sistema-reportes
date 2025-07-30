import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container" *ngIf="paginationInfo()">

      <!-- Items per page selector -->
      <div class="items-per-page">
        <label for="itemsPerPage">Mostrar:</label>
        <select
          id="itemsPerPage"
          [value]="paginationInfo()!.itemsPerPage"
          (change)="onItemsPerPageChange($event)"
          class="items-select">
          <option *ngFor="let option of itemsPerPageOptions()" [value]="option">
            {{ option }}
          </option>
        </select>
        <span>por página</span>
      </div>

      <!-- Page navigation -->
      <div class="page-navigation">
        <button
          class="btn-page btn-nav"
          (click)="onPreviousPage()"
          [disabled]="!paginationInfo()!.hasPrevPage"
          title="Página anterior">
          &#8249;
        </button>

        <button
          *ngFor="let page of getPageNumbers()"
          class="btn-page"
          [class.active]="page === paginationInfo()!.currentPage"
          (click)="onGoToPage(page)">
          {{ page }}
        </button>

        <button
          class="btn-page btn-nav"
          (click)="onNextPage()"
          [disabled]="!paginationInfo()!.hasNextPage"
          title="Página siguiente">
          &#8250;
        </button>
      </div>

      <!-- Summary information -->
      <div class="pagination-summary">
        <span class="summary-text">
          Mostrando {{ getStartRecord() }}-{{ getEndRecord() }}
          de {{ paginationInfo()!.totalItems }} registros
        </span>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 20px;
      border: 1px solid #e9ecef;
    }

    .items-per-page {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #495057;
    }

    .items-select {
      padding: 4px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background: white;
      color: #495057;
      font-size: 0.9rem;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .items-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .page-navigation {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .btn-page {
      padding: 8px 12px;
      border: 1px solid #dee2e6;
      background: white;
      color: #495057;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      min-width: 40px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-page:hover:not(:disabled) {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .btn-page:disabled {
      color: #6c757d;
      background: #f8f9fa;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-page.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
      font-weight: 600;
    }

    .btn-page.active:hover {
      background: #0056b3;
      border-color: #0056b3;
    }

    .btn-nav {
      font-weight: bold;
      font-size: 1.2rem;
    }

    .pagination-summary {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .summary-text {
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .page-navigation {
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn-page {
        padding: 6px 10px;
        min-width: 36px;
        height: 32px;
        font-size: 0.8rem;
      }

      .items-per-page,
      .pagination-summary {
        font-size: 0.8rem;
      }
    }

    @media (max-width: 480px) {
      .page-navigation {
        max-width: 100%;
      }

      .btn-page {
        padding: 5px 8px;
        min-width: 32px;
        height: 28px;
        font-size: 0.75rem;
      }
    }
  `]
})
export class PaginationComponent {
  // Inputs
  paginationInfo = input<PaginationInfo | null>(null);
  itemsPerPageOptions = input<number[]>([5, 10, 20, 50]);
  maxVisiblePages = input<number>(5);

  // Outputs
  pageChanged = output<number>();
  itemsPerPageChanged = output<number>();

  // Computed methods
  getPageNumbers(): number[] {
    const info = this.paginationInfo();
    if (!info) return [];

    const current = info.currentPage;
    const total = info.totalPages;
    const maxVisible = this.maxVisiblePages();

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStartRecord(): number {
    const info = this.paginationInfo();
    if (!info || info.totalItems === 0) return 0;

    return (info.currentPage - 1) * info.itemsPerPage + 1;
  }

  getEndRecord(): number {
    const info = this.paginationInfo();
    if (!info) return 0;

    const start = this.getStartRecord();
    return Math.min(start + info.itemsPerPage - 1, info.totalItems);
  }

  // Event handlers
  onPreviousPage(): void {
    const info = this.paginationInfo();
    if (info && info.hasPrevPage) {
      this.pageChanged.emit(info.currentPage - 1);
    }
  }

  onNextPage(): void {
    const info = this.paginationInfo();
    if (info && info.hasNextPage) {
      this.pageChanged.emit(info.currentPage + 1);
    }
  }

  onGoToPage(page: number): void {
    const info = this.paginationInfo();
    if (info && page !== info.currentPage) {
      this.pageChanged.emit(page);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newValue = parseInt(target.value, 10);
    this.itemsPerPageChanged.emit(newValue);
  }
}
