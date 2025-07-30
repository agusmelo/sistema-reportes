import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService, Invoice, InvoiceFilters, SortOptions } from '../../services/invoice.service';
import { PaginationComponent, PaginationInfo } from '../../shared/components/pagination/pagination.component';
import { StateUtilsService } from '../../shared/services/state-utils.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './invoice-list-refactored.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListRefactoredComponent implements OnInit {

  // Signals for reactive state
  invoices = signal<Invoice[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');
  expandedInvoiceId = signal<number | null>(null);
  showFilters = signal<boolean>(false);

  // Pagination signals
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  paginationInfo = signal<PaginationInfo | null>(null);

  // Sort and filter signals
  sortOptions = signal<SortOptions>({
    sortBy: 'fecha',
    sortOrder: 'DESC'
  });

  filters = signal<InvoiceFilters>({});

  // Summary data
  allInvoices = signal<Invoice[]>([]);

  // Computed properties
  totalInvoices = computed(() => this.allInvoices().length);
  totalAmount = computed(() => {
    return this.allInvoices().reduce((sum, invoice) => {
      return sum + this.getTotalAmount(invoice);
    }, 0);
  });

  averageAmount = computed(() => {
    const total = this.totalInvoices();
    return total > 0 ? this.totalAmount() / total : 0;
  });

  constructor(
    private invoiceService: InvoiceService,
    private stateUtils: StateUtilsService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadInvoices();
    await this.loadAllInvoicesForSummary();
  }

  async loadInvoices(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');

      const response = await this.invoiceService.getPaginatedInvoices(
        this.currentPage(),
        this.itemsPerPage(),
        this.sortOptions(),
        this.filters()
      );

      if (response?.data && response.pagination) {
        this.invoices.set(response.data);
        this.paginationInfo.set({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
          itemsPerPage: response.pagination.itemsPerPage,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage
        });
      } else {
        this.error.set('No se pudieron cargar las facturas - estructura de respuesta inesperada');
      }
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      this.error.set('Error al cargar las facturas: ' + (error?.message || 'Error desconocido'));
    } finally {
      this.loading.set(false);
    }
  }

  async loadAllInvoicesForSummary(): Promise<void> {
    try {
      const response = await this.invoiceService.getAllInvoices();
      if (response?.data) {
        this.allInvoices.set(response.data);
      }
    } catch (error: any) {
      console.error('Error loading all invoices for summary:', error);
    }
  }

  async refreshInvoices(): Promise<void> {
    await this.loadInvoices();
    await this.loadAllInvoicesForSummary();
  }

  // Pagination handlers
  async onPageChanged(page: number): Promise<void> {
    this.currentPage.set(page);
    this.expandedInvoiceId.set(null);
    await this.loadInvoices();
  }

  async onItemsPerPageChanged(itemsPerPage: number): Promise<void> {
    this.itemsPerPage.set(itemsPerPage);
    this.currentPage.set(1);
    this.expandedInvoiceId.set(null);
    await this.loadInvoices();
  }

  // Sorting
  async sortBy(column: string): Promise<void> {
    const currentSort = this.sortOptions();
    const newSortOrder = currentSort.sortBy === column && currentSort.sortOrder === 'ASC' ? 'DESC' : 'ASC';

    this.sortOptions.set({
      sortBy: column,
      sortOrder: newSortOrder
    });

    this.currentPage.set(1);
    this.expandedInvoiceId.set(null);
    await this.loadInvoices();
  }

  getSortIcon(column: string): string {
    const sort = this.sortOptions();
    if (sort.sortBy !== column) {
      return '↕️';
    }
    return sort.sortOrder === 'ASC' ? '⬆️' : '⬇️';
  }

  // Filtering
  toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  async applyFilters(): Promise<void> {
    this.currentPage.set(1);
    this.expandedInvoiceId.set(null);
    await this.loadInvoices();
  }

  async clearFilters(): Promise<void> {
    this.filters.set({});
    this.currentPage.set(1);
    this.expandedInvoiceId.set(null);
    await this.loadInvoices();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  updateFilter(key: keyof InvoiceFilters, value: any): void {
    this.filters.update(currentFilters => ({
      ...currentFilters,
      [key]: value
    }));
  }

  // Invoice details
  toggleInvoiceDetails(invoiceId: number): void {
    const currentExpanded = this.expandedInvoiceId();
    this.expandedInvoiceId.set(currentExpanded === invoiceId ? null : invoiceId);
  }

  isInvoiceExpanded(invoiceId: number): boolean {
    return this.expandedInvoiceId() === invoiceId;
  }

  // Calculations
  getTotalAmount(invoice: Invoice): number {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    return invoice.incluye_iva ? subtotal * 1.21 : subtotal;
  }

  getSubtotal(invoice: Invoice): number {
    return invoice.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  }

  // Utility methods
  formatDate(date: string): string {
    return this.stateUtils.formatDate(date);
  }

  formatCurrency(amount: number): string {
    return this.stateUtils.formatCurrency(amount);
  }

  async onDownloadPDF(invoice: Invoice): Promise<void> {
    try {
      // Note: Invoice interface doesn't have pdf_url, but we can try to generate/access it
      // For now, we'll show a message that this needs to be implemented
      alert('Funcionalidad de descarga PDF en desarrollo');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF');
    }
  }
}
