import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs/operators';

// Services
import { ClientService, Client } from '../../services/client.service';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { InvoiceService, Invoice } from '../../services/invoice.service';

// Shared components and services
import { SearchableSelectComponent } from '../searchable-select/searchable-select.component';
import {
  ConfirmationDialogComponent,
  ProcessingStepsComponent,
  ValidationMessageComponent,
  StateIndicatorComponent,
  DynamicButtonComponent
} from '../../shared/components';
import { FormStateManagerService } from '../../shared/composables/form-state-manager.service';
import { StateUtilsService } from '../../shared/services/state-utils.service';
import {
  ConfirmationData,
  DetailSection,
  ValidationMessage,
  StateIndicatorInfo
} from '../../shared/interfaces/common.interface';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchableSelectComponent,
    ConfirmationDialogComponent,
    ProcessingStepsComponent,
    ValidationMessageComponent,
    StateIndicatorComponent,
    DynamicButtonComponent
  ],
  templateUrl: './invoice-form-refactored.component.html',
  styleUrl: './invoice-form.component.css'
})
export class InvoiceFormRefactoredComponent implements OnInit {

  // Form
  invoiceForm: FormGroup;

  // Data signals
  clients = signal<Client[]>([]);
  clientNames = signal<string[]>([]);
  currentClient = signal<Client | null>(null);
  currentVehicles = signal<Vehicle[]>([]);
  vehicleBrands = signal<string[]>([]);
  vehicleModels = signal<string[]>([]);
  vehiclePlates = signal<string[]>([]);

  // State managers
  formStateManager: any;
  mileageValidationManager: any;
  yellowConfirmationManager: any;
  orangeConfirmationManager: any;

  // Computed properties
  stateIndicatorInfo = computed<StateIndicatorInfo>(() => ({
    state: this.formStateManager.currentState(),
    message: this.formStateManager.stateMessage()
  }));

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private invoiceService: InvoiceService,
    private formStateManagerService: FormStateManagerService,
    private stateUtils: StateUtilsService
  ) {
    this.invoiceForm = this.createForm();
    this.initializeStateManagers();
  }

  async ngOnInit() {
    await this.loadClients();
    this.setCurrentDate();
    this.setupFormChangeSubscription();
    await this.updateState();
  }

  private initializeStateManagers(): void {
    this.formStateManager = this.formStateManagerService.createFormStateManager(this.invoiceForm);
    this.mileageValidationManager = this.formStateManagerService.createMileageValidationManager();
    this.yellowConfirmationManager = this.formStateManagerService.createConfirmationDialogManager();
    this.orangeConfirmationManager = this.formStateManagerService.createConfirmationDialogManager();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      client_name: ['', Validators.required],
      client_id: [''],
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

  private setupFormChangeSubscription(): void {
    this.invoiceForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.updateState();
      this.updateMileageValidation();
    });
  }

  // Form array methods
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

  // Calculation methods
  getSubTotal(): number {
    return this.items.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  }

  getIVAAmount(): number {
    const subtotal = this.getSubTotal();
    return this.invoiceForm.get('incluye_iva')?.value ? subtotal * 0.22 : 0;
  }

  getGrandTotal(): number {
    return this.getSubTotal() + this.getIVAAmount();
  }

  // Data loading methods
  private async loadClients(): Promise<void> {
    try {
      const response = await this.clientService.getAllClients();
      if (response?.data) {
        this.clients.set(response.data);
        this.clientNames.set(response.data.map(client => client.nombre));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      this.clients.set([]);
      this.clientNames.set([]);
    }
  }

  onClientSelected(clientName: string): void {
    const client = this.clients().find(c => c.nombre === clientName) || null;
    this.currentClient.set(client);

    if (client) {
      this.invoiceForm.patchValue({ client_id: client.id });
      this.loadVehiclesForClient(client.id);
    } else {
      this.invoiceForm.patchValue({ client_id: '' });
      this.clearVehicleOptions();
    }
  }

  private async loadVehiclesForClient(clientId: number): Promise<void> {
    try {
      const response = await this.vehicleService.getVehiclesByClientId(clientId);
      if (response?.data) {
        this.currentVehicles.set(response.data);
        this.vehicleBrands.set([...new Set(response.data.map(v => v.marca))]);
        this.vehicleModels.set([...new Set(response.data.map(v => v.modelo))]);
        this.vehiclePlates.set(response.data.map(v => v.matricula));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      this.clearVehicleOptions();
    }
  }

  onVehiclePlateSelected(plate: string): void {
    const vehicle = this.currentVehicles().find(v => v.matricula === plate);
    if (vehicle) {
      this.mileageValidationManager.setDatabaseMileage(vehicle.kilometraje);
      this.invoiceForm.patchValue({
        make: vehicle.marca,
        model: vehicle.modelo,
        mileage: vehicle.kilometraje
      });
    } else {
      this.mileageValidationManager.reset();
    }
  }

  private clearVehicleOptions(): void {
    this.currentVehicles.set([]);
    this.vehicleBrands.set([]);
    this.vehicleModels.set([]);
    this.vehiclePlates.set([]);
    this.mileageValidationManager.reset();
  }

  private setCurrentDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.invoiceForm.patchValue({ date: today });
  }

  // State management
  private async updateState(): Promise<void> {
    const formValue = this.invoiceForm.value;
    const clientName = formValue.client_name?.trim();
    const plate = formValue.plate?.trim();

    if (!clientName || !plate || clientName.length < 2 || plate.length < 3) {
      this.formStateManager.updateState('checking', 'Complete los campos para verificar el estado');
      return;
    }

    try {
      const [clientExists, vehicleExists] = await Promise.all([
        this.checkClientExists(clientName),
        this.checkVehicleExists(plate)
      ]);

      if (clientExists && vehicleExists) {
        this.formStateManager.updateState('green', 'Cliente y vehículo existen. Solo se actualizará el kilometraje.');
      } else if (clientExists && !vehicleExists) {
        this.formStateManager.updateState('yellow', 'Cliente existe. Se agregará el vehículo al sistema.');
      } else if (!clientExists && !vehicleExists) {
        this.formStateManager.updateState('orange', 'Se agregarán el cliente y vehículo al sistema.');
      } else {
        this.formStateManager.updateState('disabled', 'Error: El vehículo existe pero pertenece a otro cliente.');
      }
    } catch (error) {
      console.error('Error checking state:', error);
      this.formStateManager.updateState('checking', 'Error al verificar el estado. Intente nuevamente.');
    }
  }

  private updateMileageValidation(): void {
    const currentMileage = this.invoiceForm.get('mileage')?.value;
    if (currentMileage !== null && currentMileage !== undefined) {
      this.mileageValidationManager.setCurrentMileage(Number(currentMileage));
    }
  }

  private async checkClientExists(clientName: string): Promise<boolean> {
    try {
      const response = await this.clientService.getClientByName(clientName);
      return response?.data?.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async checkVehicleExists(plate: string): Promise<boolean> {
    try {
      const response = await this.vehicleService.getVehicleByMatricula(plate);
      return response?.data?.id !== undefined;
    } catch (error) {
      return false;
    }
  }

  // Form submission
  async onSubmit(): Promise<void> {
    if (!this.invoiceForm.valid || this.formStateManager.isFormDisabled()) return;

    const currentState = this.formStateManager.currentState();

    if (currentState === 'yellow') {
      this.showYellowConfirmation();
      return;
    }

    if (currentState === 'orange') {
      this.showOrangeConfirmation();
      return;
    }

    await this.executeWorkflow();
  }

  private showYellowConfirmation(): void {
    const formValue = this.invoiceForm.value;

    const confirmationData: ConfirmationData = {
      title: '🚗 Confirmar Información del Vehículo',
      message: `Se agregará el siguiente vehículo al cliente ${formValue.client_name}:`
    };

    const sections: DetailSection[] = [{
      title: 'Información del Vehículo',
      icon: '🚗',
      items: [
        { label: 'Marca', value: formValue.make },
        { label: 'Modelo', value: formValue.model },
        { label: 'Matrícula', value: formValue.plate },
        { label: 'Kilometraje', value: `${formValue.mileage} km` }
      ]
    }];

    this.yellowConfirmationManager.show(confirmationData, sections);
  }

  private showOrangeConfirmation(): void {
    const formValue = this.invoiceForm.value;

    const confirmationData: ConfirmationData = {
      title: '👤🚗 Confirmar Información del Cliente y Vehículo',
      message: 'Se creará el siguiente cliente y se agregará el vehículo al sistema:'
    };

    const sections: DetailSection[] = [
      {
        title: 'Información del Cliente',
        icon: '📋',
        items: [
          { label: 'Nombre', value: formValue.client_name }
        ]
      },
      {
        title: 'Información del Vehículo',
        icon: '🚗',
        items: [
          { label: 'Marca', value: formValue.make },
          { label: 'Modelo', value: formValue.model },
          { label: 'Matrícula', value: formValue.plate },
          { label: 'Kilometraje', value: `${formValue.mileage} km` }
        ]
      }
    ];

    this.orangeConfirmationManager.show(confirmationData, sections);
  }

  async onConfirmYellow(): Promise<void> {
    this.yellowConfirmationManager.hide();
    await this.executeWorkflow();
  }

  onCancelYellow(): void {
    this.yellowConfirmationManager.hide();
  }

  async onConfirmOrange(): Promise<void> {
    this.orangeConfirmationManager.hide();
    await this.executeWorkflow();
  }

  onCancelOrange(): void {
    this.orangeConfirmationManager.hide();
  }

  private async executeWorkflow(): Promise<void> {
    this.formStateManager.setProcessing(true);

    try {
      const formValue = this.invoiceForm.value;
      await this.executeWorkflowByState(formValue);
    } catch (error: any) {
      console.error('Error in workflow:', error);
      alert('Error processing invoice: ' + (error.error?.message || error.message || 'Unknown error'));
    } finally {
      this.formStateManager.setProcessing(false);
    }
  }

  private async executeWorkflowByState(formValue: any): Promise<void> {
    const clientName = formValue.client_name.trim();
    const state = this.formStateManager.currentState();

    const steps = this.stateUtils.getCommonProcessingSteps();

    switch (state) {
      case 'green':
        this.formStateManager.addProcessingStep(steps.clientFound);
        this.formStateManager.addProcessingStep(steps.updatingMileage);
        await this.createInvoiceDirectly(formValue);
        this.formStateManager.addProcessingStep(steps.generatingInvoice);
        break;

      case 'yellow':
        this.formStateManager.addProcessingStep(steps.clientFound);
        this.formStateManager.addProcessingStep(steps.addingVehicle);
        await this.createVehicleForClient(formValue);
        this.formStateManager.addProcessingStep(steps.generatingInvoice);
        await this.createInvoiceDirectly(formValue);
        break;

      case 'orange':
        this.formStateManager.addProcessingStep(steps.creatingClient);
        const newClient = await this.createNewClient(clientName);
        this.formStateManager.addProcessingStep(steps.addingVehicle);
        await this.createVehicleForClient({...formValue, client_id: newClient});
        this.formStateManager.addProcessingStep(steps.generatingInvoice);
        await this.createInvoiceDirectly(formValue);
        break;
    }

    this.formStateManager.addProcessingStep(steps.completed);
  }

  // API methods (keeping existing implementation)
  private async createNewClient(clientName: string): Promise<Client> {
    const response = await this.clientService.createClient({ nombre: clientName });
    if (!response.data) {
      throw new Error('Failed to create client');
    }
    return response.data;
  }

  private async createVehicleForClient(formValue: any): Promise<Vehicle> {
    const clientId = formValue.client_id || this.currentClient()?.id;
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
    if (!response?.data) {
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
    if (response?.data?.pdfUrl) {
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
    }
  }
}
