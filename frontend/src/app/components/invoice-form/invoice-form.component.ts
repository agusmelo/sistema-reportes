import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs/operators';
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
  client_id:string = '';
  vehicleBrands: string[] = [];
  vehicleModels: string[] = [];
  vehiclePlates: string[] = [];

  currentClient: Client | null = null;
  currentVehicles: Vehicle[] = [];

  // Dynamic state management
  currentState: 'green' | 'yellow' | 'orange' | 'disabled' | 'checking' = 'checking';
  stateMessage: string = '';
  isProcessing: boolean = false;
  processingSteps: string[] = [];

  // Vehicle confirmation properties for yellow state
  showVehicleConfirmation = false;
  vehicleToConfirm: any = null;

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

    // Subscribe to form changes to update state dynamically with debounce
    this.invoiceForm.valueChanges.pipe(
      debounceTime(500) // Wait 500ms after user stops typing
    ).subscribe(() => {
      this.updateState();
    });

    // Initial state check
    this.updateState();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      client_name: ['', Validators.required],
      client_id:[''],
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
      this.invoiceForm.patchValue({ client_id: this.currentClient.id });
      this.loadVehiclesForClient(this.currentClient.id);
    } else {
      this.invoiceForm.patchValue({ client_id: '' });
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

  // Dynamic state management methods
  private async updateState(): Promise<void> {
    const formValue = this.invoiceForm.value;
    const clientName = formValue.client_name?.trim();
    const make = formValue.make?.trim();
    const model = formValue.model?.trim();
    const plate = formValue.plate?.trim();

    if (!clientName || !make || !model || !plate) {
      this.currentState = 'checking';
      this.stateMessage = 'Complete todos los campos para verificar el estado';
      return;
    }

    // Prevent unnecessary API calls for very short inputs
    if (clientName.length < 2 || plate.length < 3) {
      this.currentState = 'checking';
      this.stateMessage = 'Complete los campos para verificar el estado';
      return;
    }

    try {
      const [clientExists, vehicleExists] = await Promise.all([
        this.checkClientExists(clientName),
        this.checkVehicleExists(plate)
      ]);

      if (clientExists && vehicleExists) {
        // (1) Verde: Cliente existe + auto existe
        this.currentState = 'green';
        this.stateMessage = 'Cliente y vehículo existen. Solo se actualizará el kilometraje.';
      } else if (clientExists && !vehicleExists) {
        // (2) Amarillo: Cliente existe + auto no existe
        this.currentState = 'yellow';
        this.stateMessage = 'Cliente existe. Se agregará el vehículo al sistema.';
      } else if (!clientExists && !vehicleExists) {
        // (3) Naranja: Cliente no existe + auto no existe
        this.currentState = 'orange';
        this.stateMessage = 'Se agregarán el cliente y vehículo al sistema.';
      } else {
        // (4) Deshabilitado: Cliente no existe + auto existe
        this.currentState = 'disabled';
        this.stateMessage = 'Error: El vehículo existe pero pertenece a otro cliente.';
      }
    } catch (error) {
      console.error('Error checking state:', error);
      this.currentState = 'checking';
      this.stateMessage = 'Error al verificar el estado. Intente nuevamente.';
    }
  }

  private async checkClientExists(clientName: string): Promise<boolean> {
    try {
      const response = await this.clientService.getClientByName(clientName);
      return response && response.data && response.data.length > 0;
    } catch (error) {
      console.error('Error checking client:', error);
      return false;
    }
  }

  private async checkVehicleExists(plate: string): Promise<boolean> {
    try {
      const response = await this.vehicleService.getVehicleByMatricula(plate);
      return response && response.data && response.data.id !== undefined;
    } catch (error) {
      // If vehicle doesn't exist, API might return 404, which is expected
      return false;
    }
  }

  getStateColor(): string {
    switch (this.currentState) {
      case 'green': return '#28a745';
      case 'yellow': return '#ffc107';
      case 'orange': return '#fd7e14';
      case 'disabled': return '#6c757d';
      default: return '#007bff';
    }
  }

  getStateIcon(): string {
    switch (this.currentState) {
      case 'green': return '✅';
      case 'yellow': return '⚠️';
      case 'orange': return '🟠';
      case 'disabled': return '❌';
      default: return '🔄';
    }
  }

  isButtonDisabled(): boolean {
    return this.invoiceForm.invalid || this.currentState === 'disabled' || this.isProcessing;
  }

  getButtonText(): string {
    switch (this.currentState) {
      case 'green': return 'Generar Factura (Actualizar Kilometraje)';
      case 'yellow': return 'Revisar Vehículo y Generar Factura';
      case 'orange': return 'Generar Factura (Crear Cliente y Vehículo)';
      case 'disabled': return 'No Permitido (Vehículo de Otro Cliente)';
      default: return 'Verificando...';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.invoiceForm.valid && !this.isButtonDisabled()) {
      
      // Special handling for yellow state - show confirmation first
      if (this.currentState === 'yellow') {
        this.showVehicleConfirmationDialog();
        return;
      }

      this.isProcessing = true;
      this.processingSteps = [];

      try {
        const formValue = this.invoiceForm.value;
        await this.executeWorkflowByState(formValue);
      } catch (error: any) {
        console.error('Error in workflow:', error);
        alert('Error processing invoice: ' + (error.error?.message || error.message || 'Unknown error'));
      } finally {
        this.isProcessing = false;
        this.processingSteps = [];
      }
    } else {
      alert('Please fill all required fields correctly');
    }
  }

  private async executeWorkflowByState(formValue: any): Promise<void> {
    const clientName = formValue.client_name.trim();
    const plate = formValue.plate.trim();

    switch (this.currentState) {
      case 'green':
        // (1) Verde: Cliente existe + auto existe, solo actualizar kilometraje
        this.addProcessingStep('✅ Cliente y vehículo encontrados');
        this.addProcessingStep('🔄 Actualizando kilometraje...');
        await this.createInvoiceDirectly(formValue);
        this.addProcessingStep('📄 Generando factura...');
        break;

      case 'yellow':
        // (2) Amarillo: Cliente existe + auto no existe
        this.addProcessingStep('✅ Cliente encontrado');
        this.addProcessingStep('➕ Agregando vehículo...');
        await this.createVehicleForClient(formValue);
        this.addProcessingStep('📄 Generando factura...');
        await this.createInvoiceDirectly(formValue);
        break;

      case 'orange':
        // (3) Naranja: Cliente no existe + auto no existe
        this.addProcessingStep('➕ Creando cliente...');
        const newClient = await this.createNewClient(clientName);
        this.addProcessingStep('➕ Agregando vehículo...');
        await this.createVehicleForClient({...formValue, client_id: newClient.id});
        this.addProcessingStep('📄 Generando factura...');
        await this.createInvoiceDirectly({...formValue, client_id: newClient.id});
        break;

      default:
        throw new Error('Invalid state for invoice generation');
    }

    this.addProcessingStep('✅ ¡Factura generada exitosamente!');
  }

  private addProcessingStep(step: string): void {
    this.processingSteps.push(step);
  }

  private async createNewClient(clientName: string): Promise<Client> {
    const response = await this.clientService.createClient({ nombre: clientName });
    if (!response || !response.data) {
      throw new Error('Failed to create client');
    }
    return response.data;
  }

  private async createVehicleForClient(formValue: any): Promise<Vehicle> {
    const clientId = formValue.client_id || this.currentClient?.id;
    if (!clientId) {
      throw new Error('Client ID not found');
    }

    const vehicleData = {
      cliente_id: clientId,
      marca: formValue.make,
      modelo: formValue.model,
      matricula: formValue.plate,
      kilometraje: Number(formValue.mileage)
    };

    const response = await this.vehicleService.createVehicle(vehicleData);
    if (!response || !response.data) {
      throw new Error('Failed to create vehicle');
    }
    return response.data;
  }

  private async createInvoiceDirectly(formValue: any): Promise<void> {
    const invoice: Invoice = {
      ...formValue,
      mileage: Number(formValue.mileage)
    };

    const response = await this.invoiceService.createInvoice(invoice);
    if (response && response.data && response.data.pdfUrl) {
      // Show success and open PDF
      setTimeout(() => {
        alert(`¡Factura generada exitosamente! PDF: ${response.data.pdfUrl}`);
        window.open(response.data.pdfUrl, '_blank');
      }, 1000);
    } else {
      throw new Error('Invalid response from invoice creation');
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

  // Vehicle confirmation methods for yellow state
  showVehicleConfirmationDialog(): void {
    const formValue = this.invoiceForm.value;
    this.vehicleToConfirm = {
      marca: formValue.make,
      modelo: formValue.model,
      matricula: formValue.plate,
      kilometraje: formValue.mileage,
      cliente: formValue.client_name
    };
    this.showVehicleConfirmation = true;
  }

  async confirmVehicleAndProceed(): Promise<void> {
    this.showVehicleConfirmation = false;
    this.isProcessing = true;
    this.processingSteps = [];

    try {
      const formValue = this.invoiceForm.value;
      await this.executeWorkflowByState(formValue);
    } catch (error: any) {
      console.error('Error in workflow:', error);
      alert('Error processing invoice: ' + (error.error?.message || error.message || 'Unknown error'));
    } finally {
      this.isProcessing = false;
      this.processingSteps = [];
      this.vehicleToConfirm = null;
    }
  }

  cancelVehicleConfirmation(): void {
    this.showVehicleConfirmation = false;
    this.vehicleToConfirm = null;
  }
}
