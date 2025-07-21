import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService, Invoice } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-list',
  imports: [CommonModule],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  loading: boolean = false;
  error: string = '';
  expandedInvoiceId: number | null = null;

  constructor(private invoiceService: InvoiceService) {}

  async ngOnInit(): Promise<void> {
    await this.loadInvoices();
  }

  async loadInvoices(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';
      const response = await this.invoiceService.getAllInvoices();

      if (response && response.data) {
        this.invoices = response.data;
      } else {
        this.error = 'No se pudieron cargar las facturas';
      }
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      this.error = 'Error al cargar las facturas: ' + (error?.message || 'Error desconocido');
    } finally {
      this.loading = false;
    }
  }

  async refreshInvoices(): Promise<void> {
    await this.loadInvoices();
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
    return this.invoices.reduce((sum, invoice) => sum + this.getTotalAmount(invoice), 0);
  }

  getInvoicesWithIVA(): number {
    return this.invoices.filter(invoice => invoice.incluye_iva).length;
  }
}
