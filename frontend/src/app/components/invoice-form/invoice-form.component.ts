import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchableSelectComponent } from '../searchable-select/searchable-select.component';
import { ClientService, Client } from '../../services/client.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { InvoiceService, Invoice, InvoiceItem } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-form',
  imports: [CommonModule, ReactiveFormsModule, SearchableSelectComponent],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.css'
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  clients: Client[] = [];
  clientNames: string[] = [];
  vehicleBrands: string[] = [];
  vehicleModels: string[] = [];
  vehiclePlates: string[] = [];

  currentClient: Client | null = null;
  currentVehicles: Vehicle[] = [];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private invoiceService: InvoiceService
  ) {
    this.invoiceForm = this.createForm();
  }

  ngOnInit() {
    this.loadClients();
    this.setCurrentDate();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      client_name: ['', Validators.required],
      date: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      plate: ['', Validators.required],
      mileage: ['', [Validators.required, Validators.min(0)]],
      incluye_iva: [false],
      items: this.fb.array([this.createItemGroup()])
    });
  }

  private createItemGroup(): FormGroup {
    return this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  getItemLineTotal(index: number): number {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  getSubTotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemLineTotal(i);
    }
    return total;
  }

  getIVAAmount(): number {
    const includeIVA = this.invoiceForm.get('incluye_iva')?.value;
    return includeIVA ? this.getSubTotal() * 0.22 : 0;
  }

  getGrandTotal(): number {
    return this.getSubTotal() + this.getIVAAmount();
  }

  private async loadClients(): Promise<void> {
    try {
      const response = await this.clientService.getAllClients();
      if (response && response.data && Array.isArray(response.data)) {
        this.clients = response.data;
        this.clientNames = this.clients.map(client => client.nombre);
      } else {
        console.error('Invalid clients response structure:', response);
        this.clients = [];
        this.clientNames = [];
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      this.clients = [];
      this.clientNames = [];
    }
  }

  onClientSelected(clientName: string): void {
    this.currentClient = this.clients.find(c => c.nombre === clientName) || null;

    if (this.currentClient) {
      this.loadVehiclesForClient(this.currentClient.id);
    } else {
      this.clearVehicleOptions();
    }
  }

  private async loadVehiclesForClient(clientId: number): Promise<void> {
    try {
      const response = await this.vehicleService.getVehiclesByClientId(clientId);
      if (response && response.data && Array.isArray(response.data)) {
        this.currentVehicles = response.data;
        this.vehicleBrands = [...new Set(this.currentVehicles.map(v => v.marca))];
        this.vehicleModels = [...new Set(this.currentVehicles.map(v => v.modelo))];
        this.vehiclePlates = this.currentVehicles.map(v => v.matricula);
      } else {
        console.error('Invalid vehicles response structure:', response);
        this.clearVehicleOptions();
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      this.clearVehicleOptions();
    }
  }

  onVehiclePlateSelected(plate: string): void {
    const vehicle = this.currentVehicles.find(v => v.matricula === plate);
    if (vehicle) {
      this.invoiceForm.patchValue({
        make: vehicle.marca,
        model: vehicle.modelo,
        mileage: vehicle.kilometraje
      });
    }
  }

  private clearVehicleOptions(): void {
    this.currentVehicles = [];
    this.vehicleBrands = [];
    this.vehicleModels = [];
    this.vehiclePlates = [];
  }

  private setCurrentDate(): void {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    this.invoiceForm.patchValue({ date: dateString });
  }

  async onSubmit(): Promise<void> {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;
      const invoice: Invoice = {
        ...formValue,
        mileage: Number(formValue.mileage)
      };

      try {
        const response = await this.invoiceService.createInvoice(invoice);
        alert(`Invoice created successfully! PDF: ${response.data.pdfUrl}`);
        window.open(response.data.pdfUrl, '_blank');
      } catch (error: any) {
        console.error('Error creating invoice:', error);
        alert('Error creating invoice: ' + (error.error?.message || 'Unknown error'));
      }
    } else {
      alert('Please fill all required fields');
    }
  }

  async onEmergencySubmit(): Promise<void> {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;
      const invoice: Invoice = {
        ...formValue,
        mileage: Number(formValue.mileage)
      };

      try {
        const response = await this.invoiceService.createInvoice(invoice, { emergencia: 'true' });
        alert(`Emergency invoice created! PDF: ${response.data.pdfUrl}`);
        window.open(response.data.pdfUrl, '_blank');
      } catch (error: any) {
        console.error('Error creating emergency invoice:', error);
        alert('Error creating emergency invoice: ' + (error.error?.message || 'Unknown error'));
      }
    } else {
      alert('Please fill all required fields');
    }
  }
}
