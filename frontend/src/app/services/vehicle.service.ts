import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from './client.service';

export interface Vehicle {
  id: number;
  cliente_id: number;
  marca: string;
  modelo: string;
  matricula: string;
  kilometraje: number;
  cliente_nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private api: ApiService) { }

  getAllVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return firstValueFrom(this.api.get<ApiResponse<Vehicle[]>>('/vehiculos/all'));
  }

  getVehicleById(id: number): Promise<ApiResponse<Vehicle>> {
    return firstValueFrom(this.api.get<ApiResponse<Vehicle>>(`/vehiculos/${id}`));
  }

  getVehiclesByClientId(clientId: number): Promise<ApiResponse<Vehicle[]>> {
    return firstValueFrom(this.api.get<ApiResponse<Vehicle[]>>(`/vehiculos/cliente/${clientId}`));
  }

  getVehicleByMatricula(matricula: string): Promise<ApiResponse<Vehicle>> {
    return firstValueFrom(this.api.get<ApiResponse<Vehicle>>(`/vehiculos/matricula/${matricula}`));
  }

  getModelsByBrand(clientId: number, marca: string): Promise<ApiResponse<string[]>> {
    return firstValueFrom(this.api.get<ApiResponse<string[]>>(`/vehiculos/modelo/${clientId}/${marca}`));
  }

  createVehicle(vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return firstValueFrom(this.api.post<ApiResponse<Vehicle>>('/vehiculos', vehicle));
  }

  updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return firstValueFrom(this.api.put<ApiResponse<Vehicle>>(`/vehiculos/${id}`, vehicle));
  }

  deleteVehicle(id: number): Promise<ApiResponse<any>> {
    return firstValueFrom(this.api.delete<ApiResponse<any>>(`/vehiculos/${id}`));
  }
}
