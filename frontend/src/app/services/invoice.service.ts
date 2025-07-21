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

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private api: ApiService) { }

  getAllInvoices(): Promise<ApiResponse<Invoice[]>> {
    return firstValueFrom(this.api.get<ApiResponse<Invoice[]>>('/facturas/all'));
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
