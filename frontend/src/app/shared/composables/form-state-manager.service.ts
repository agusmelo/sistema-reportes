import { Injectable, signal, computed, effect } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StateUtilsService } from '../services/state-utils.service';
import { ButtonState, ValidationMessage } from '../interfaces/common.interface';

export interface FormStateManager {
  // State signals
  currentState: any;
  stateMessage: any;
  isProcessing: any;
  processingSteps: any;
  validationMessage: any;
  
  // Computed signals
  buttonState: any;
  isFormDisabled: any;
  
  // Methods
  updateState: (state: 'green' | 'yellow' | 'orange' | 'disabled' | 'checking', message: string) => void;
  setProcessing: (processing: boolean) => void;
  addProcessingStep: (step: string) => void;
  clearProcessingSteps: () => void;
  setValidationMessage: (message: ValidationMessage | null) => void;
  reset: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class FormStateManagerService {

  constructor(private stateUtils: StateUtilsService) {}

  /**
   * Creates a form state manager with reactive signals
   */
  createFormStateManager(form: FormGroup): FormStateManager {
    
    // Core state signals
    const currentState = signal<'green' | 'yellow' | 'orange' | 'disabled' | 'checking'>('checking');
    const stateMessage = signal<string>('Verificando estado...');
    const isProcessing = signal<boolean>(false);
    const processingSteps = signal<string[]>([]);
    const validationMessage = signal<ValidationMessage | null>(null);

    // Computed signals
    const buttonState = computed(() => {
      return this.stateUtils.createButtonState(
        currentState(),
        isProcessing(),
        form.valid
      );
    });

    const isFormDisabled = computed(() => {
      return isProcessing() || currentState() === 'disabled' || currentState() === 'checking';
    });

    // Effect to watch form validity changes
    effect(() => {
      if (form.valid) {
        // Form became valid, might want to re-check state
      }
    });

    // Methods
    const updateState = (
      state: 'green' | 'yellow' | 'orange' | 'disabled' | 'checking',
      message: string
    ) => {
      currentState.set(state);
      stateMessage.set(message);
    };

    const setProcessing = (processing: boolean) => {
      isProcessing.set(processing);
      if (!processing) {
        clearProcessingSteps();
      }
    };

    const addProcessingStep = (step: string) => {
      processingSteps.update(steps => [...steps, step]);
    };

    const clearProcessingSteps = () => {
      processingSteps.set([]);
    };

    const setValidationMessage = (message: ValidationMessage | null) => {
      validationMessage.set(message);
    };

    const reset = () => {
      currentState.set('checking');
      stateMessage.set('Verificando estado...');
      isProcessing.set(false);
      processingSteps.set([]);
      validationMessage.set(null);
    };

    return {
      // Signals
      currentState,
      stateMessage,
      isProcessing,
      processingSteps,
      validationMessage,
      
      // Computed
      buttonState,
      isFormDisabled,
      
      // Methods
      updateState,
      setProcessing,
      addProcessingStep,
      clearProcessingSteps,
      setValidationMessage,
      reset
    };
  }

  /**
   * Creates a mileage validation manager
   */
  createMileageValidationManager() {
    const databaseMileage = signal<number | null>(null);
    const currentMileage = signal<number>(0);
    
    const isValid = computed(() => {
      const dbMileage = databaseMileage();
      const currentMileageValue = currentMileage();
      
      if (dbMileage === null) return true;
      return currentMileageValue >= dbMileage;
    });

    const validationMessage = computed(() => {
      const dbMileage = databaseMileage();
      const currentMileageValue = currentMileage();
      
      if (dbMileage !== null && currentMileageValue < dbMileage) {
        return this.stateUtils.createMileageValidationMessage(currentMileageValue, dbMileage);
      }
      return null;
    });

    return {
      databaseMileage,
      currentMileage,
      isValid,
      validationMessage,
      
      setDatabaseMileage: (mileage: number | null) => databaseMileage.set(mileage),
      setCurrentMileage: (mileage: number) => currentMileage.set(mileage),
      reset: () => {
        databaseMileage.set(null);
        currentMileage.set(0);
      }
    };
  }

  /**
   * Creates a confirmation dialog manager
   */
  createConfirmationDialogManager() {
    const isVisible = signal<boolean>(false);
    const confirmationData = signal<any>(null);
    const sections = signal<any[]>([]);

    return {
      isVisible,
      confirmationData,
      sections,
      
      show: (data: any, sectionsData: any[] = []) => {
        confirmationData.set(data);
        sections.set(sectionsData);
        isVisible.set(true);
      },
      
      hide: () => {
        isVisible.set(false);
        confirmationData.set(null);
        sections.set([]);
      }
    };
  }
}
