import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService, Invoice, PaginationInfo, InvoiceFilters, SortOptions } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  loading: boolean = false;
  error: string = '';
  expandedInvoiceId: number | null = null;

  // Backend pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginationInfo: PaginationInfo | null = null;

  // Sorting properties
  sortOptions: SortOptions = {
    sortBy: 'fecha',
    sortOrder: 'DESC'
  };

  // Filtering properties
  filters: InvoiceFilters = {};
  showFilters: boolean = false;

  // For summary statistics (we'll need all invoices for this)
  allInvoices: Invoice[] = [];

  constructor(private invoiceService: InvoiceService) {}

  async ngOnInit(): Promise<void> {
    await this.loadInvoices();
    await this.loadAllInvoicesForSummary();
  }

  async loadInvoices(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';
      const response = await this.invoiceService.getPaginatedInvoices(
        this.currentPage,
        this.itemsPerPage,
        this.sortOptions,
        this.filters
      );

      console.log('Response from API:', response); // Debug log

      if (response && response.data && response.pagination) {
        // Backend returns { data: Invoice[], pagination: PaginationInfo, message: string }
        this.invoices = response.data;
        this.paginationInfo = response.pagination;
        console.log('Invoices loaded:', this.invoices.length); // Debug log
        console.log('Pagination info:', this.paginationInfo); // Debug log
      } else {
        this.error = 'No se pudieron cargar las facturas - estructura de respuesta inesperada';
        console.error('Unexpected response structure:', response); // Debug log
      }
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      this.error = 'Error al cargar las facturas: ' + (error?.message || 'Error desconocido');
    } finally {
      this.loading = false;
    }
  }

  async loadAllInvoicesForSummary(): Promise<void> {
    try {
      // Load all invoices for summary statistics (keep existing behavior)
      const response = await this.invoiceService.getAllInvoices();
      if (response && response.data) {
        this.allInvoices = response.data;
      }
    } catch (error: any) {
      console.error('Error loading all invoices for summary:', error);
      // Don't set error here as it's just for summary stats
    }
  }

  async refreshInvoices(): Promise<void> {
    await this.loadInvoices();
    await this.loadAllInvoicesForSummary();
  }

  getTotalAmount(invoice: Invoice): number {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    return invoice.incluye_iva ? subtotal * 1.21 : subtotal;
  }

  getSubtotal(invoice: Invoice): number {
    return invoice.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  onViewInvoice(invoice: Invoice): void {
    // Toggle expanded state - if clicked invoice is already expanded, collapse it
    if (this.expandedInvoiceId === invoice.id) {
      this.expandedInvoiceId = null;
    } else {
      this.expandedInvoiceId = invoice.id || null;
    }
  }

  isInvoiceExpanded(invoiceId: number): boolean {
    return this.expandedInvoiceId === invoiceId;
  }

  onDownloadPDF(invoice: Invoice): void {
    // For now, show a message about PDF functionality
    // This would need to be implemented based on how PDFs are stored/served
    alert(`Funcionalidad de descarga de PDF para la factura ${invoice.id} no implementada aún.\n\nEsta función requeriría:\n1. Endpoint del backend para servir PDFs\n2. Sistema de almacenamiento de PDFs\n3. Enlaces a archivos PDF generados`);
  }

  getTotalAllInvoices(): number {
    if (!this.allInvoices || this.allInvoices.length === 0) return 0;
    return this.allInvoices.reduce((sum, invoice) => sum + this.getTotalAmount(invoice), 0);
  }

  getInvoicesWithIVA(): number {
    if (!this.allInvoices || this.allInvoices.length === 0) return 0;
    return this.allInvoices.filter(invoice => invoice.incluye_iva).length;
  }

  // Backend pagination methods
  async goToPage(page: number): Promise<void> {
    if (this.paginationInfo && page >= 1 && page <= this.paginationInfo.totalPages) {
      this.currentPage = page;
      // Collapse any expanded invoice when changing page
      this.expandedInvoiceId = null;
      await this.loadInvoices();
    }
  }

  async nextPage(): Promise<void> {
    if (this.paginationInfo?.hasNextPage) {
      await this.goToPage(this.currentPage + 1);
    }
  }

  async previousPage(): Promise<void> {
    if (this.paginationInfo?.hasPrevPage) {
      await this.goToPage(this.currentPage - 1);
    }
  }

  async changeItemsPerPage(newItemsPerPage: number): Promise<void> {
    this.itemsPerPage = newItemsPerPage;
    this.currentPage = 1;
    await this.loadInvoices();
  }

  async onItemsPerPageChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    await this.changeItemsPerPage(+target.value);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (!this.paginationInfo) return [];

    if (this.paginationInfo.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.paginationInfo.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(this.paginationInfo.totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getStartRecord(): number {
    if (!this.paginationInfo) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndRecord(): number {
    if (!this.paginationInfo) return 0;
    return Math.min(this.currentPage * this.itemsPerPage, this.paginationInfo.totalItems);
  }

  getTotalRecords(): number {
    return this.paginationInfo?.totalItems || 0;
  }

  // Sorting methods
  async sortBy(column: string): Promise<void> {
    if (this.sortOptions.sortBy === column) {
      // Toggle sort order if same column
      this.sortOptions.sortOrder = this.sortOptions.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      // Set new column with default DESC order
      this.sortOptions.sortBy = column;
      this.sortOptions.sortOrder = 'DESC';
    }

    this.currentPage = 1; // Reset to first page when sorting
    this.expandedInvoiceId = null; // Collapse any expanded invoice
    await this.loadInvoices();
  }

  getSortIcon(column: string): string {
    if (this.sortOptions.sortBy !== column) {
      return '↕️'; // Both arrows for unsorted
    }
    return this.sortOptions.sortOrder === 'ASC' ? '⬆️' : '⬇️';
  }

  // Filtering methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  async applyFilters(): Promise<void> {
    this.currentPage = 1; // Reset to first page when filtering
    this.expandedInvoiceId = null; // Collapse any expanded invoice
    await this.loadInvoices();
  }

  async clearFilters(): Promise<void> {
    this.filters = {};
    this.currentPage = 1;
    this.expandedInvoiceId = null;
    await this.loadInvoices();
  }

  onFilterChange(): void {
    // Auto-apply filters as user types (with debounce would be better, but this works for now)
    this.applyFilters();
  }
}
