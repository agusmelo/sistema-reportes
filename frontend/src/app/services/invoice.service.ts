import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from './client.service';

export interface InvoiceItem {
  cantidad: number;
  descripcion: string;
  precio_unitario: number;
}

export interface Invoice {
  id?: number;
  cliente_nombre: string;
  fecha: string;
  marca: string;
  modelo: string;
  matricula: string;
  mileage: number;
  incluye_iva: boolean;
  items: InvoiceItem[];
}

export interface InvoiceResponse {
  id: number;
  pdfUrl: string;
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface InvoiceFilters {
  cliente_nombre?: string;
  marca?: string;
  modelo?: string;
  matricula?: string;
  incluye_iva?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface SortOptions {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export interface PaginatedInvoicesResponse {
  data: Invoice[];
  pagination: PaginationInfo;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private api: ApiService) { }

  getAllInvoices(): Promise<ApiResponse<Invoice[]>> {
    return firstValueFrom(this.api.get<ApiResponse<Invoice[]>>('/facturas/all'));
  }

  getPaginatedInvoices(
    page: number = 1, 
    limit: number = 10, 
    sortOptions?: SortOptions,
    filters?: InvoiceFilters
  ): Promise<{data: Invoice[], pagination: PaginationInfo, message: string}> {
    let queryParams = `page=${page}&limit=${limit}`;
    
    if (sortOptions) {
      queryParams += `&sortBy=${sortOptions.sortBy}&sortOrder=${sortOptions.sortOrder}`;
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    return firstValueFrom(this.api.get<{data: Invoice[], pagination: PaginationInfo, message: string}>(`/facturas/paginated?${queryParams}`));
  }

  getInvoiceById(id: number): Promise<ApiResponse<Invoice>> {
    return firstValueFrom(this.api.get<ApiResponse<Invoice>>(`/facturas/${id}`));
  }

  createInvoice(invoice: Invoice, params?: { emergencia?: string }): Promise<ApiResponse<InvoiceResponse>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return firstValueFrom(this.api.post<ApiResponse<InvoiceResponse>>(`/facturas${queryParams}`, invoice));
  }

  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return firstValueFrom(this.api.put<ApiResponse<Invoice>>(`/facturas/${id}`, invoice));
  }

  deleteInvoice(id: number): Promise<ApiResponse<any>> {
    return firstValueFrom(this.api.delete<ApiResponse<any>>(`/facturas/${id}`));
  }
}
