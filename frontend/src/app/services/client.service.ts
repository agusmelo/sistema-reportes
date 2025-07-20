import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface Client {
  id: number;
  nombre: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private api: ApiService) { }

  getAllClients(): Promise<ApiResponse<Client[]>> {
    return firstValueFrom(this.api.get<ApiResponse<Client[]>>('/clientes/all'));
  }

  getClientById(id: number): Promise<ApiResponse<Client>> {
    return firstValueFrom(this.api.get<ApiResponse<Client>>(`/clientes/${id}`));
  }

  getClientByName(name: string): Promise<ApiResponse<Client[]>> {
    return firstValueFrom(this.api.get<ApiResponse<Client[]>>(`/clientes/nombre/${name}`));
  }

  createClient(client: Partial<Client>): Promise<ApiResponse<Client>> {
    return firstValueFrom(this.api.post<ApiResponse<Client>>('/clientes', client));
  }

  updateClient(id: number, client: Partial<Client>): Promise<ApiResponse<Client>> {
    return firstValueFrom(this.api.put<ApiResponse<Client>>(`/clientes/${id}`, client));
  }

  deleteClient(id: number): Promise<ApiResponse<any>> {
    return firstValueFrom(this.api.delete<ApiResponse<any>>(`/clientes/${id}`));
  }
}
