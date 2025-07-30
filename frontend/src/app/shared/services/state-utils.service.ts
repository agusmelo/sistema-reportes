import { Injectable, signal, computed } from '@angular/core';
import { ButtonState, ValidationMessage } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class StateUtilsService {

  /**
   * Creates a button state object based on form state and processing status
   */
  createButtonState(
    currentState: 'green' | 'yellow' | 'orange' | 'disabled' | 'checking',
    isProcessing: boolean,
    isFormValid: boolean
  ): ButtonState {

    if (isProcessing) {
      return {
        state: 'processing',
        text: 'Procesando...',
        icon: '⚙️',
        color: '#007bff',
        disabled: true
      };
    }

    const disabled = !isFormValid || currentState === 'disabled' || currentState === 'checking';

    switch (currentState) {
      case 'green':
        return {
          state: 'green',
          text: 'Generar Factura (Actualizar Kilometraje)',
          icon: '✅',
          color: '#28a745',
          disabled
        };

      case 'yellow':
        return {
          state: 'yellow',
          text: 'Revisar Vehículo y Generar Factura',
          icon: '⚠️',
          color: '#ffc107',
          disabled
        };

      case 'orange':
        return {
          state: 'orange',
          text: 'Revisar Cliente y Vehículo y Generar Factura',
          icon: '🟠',
          color: '#fd7e14',
          disabled
        };

      case 'disabled':
        return {
          state: 'disabled',
          text: 'No Permitido (Vehículo de Otro Cliente)',
          icon: '❌',
          color: '#6c757d',
          disabled: true
        };

      case 'checking':
      default:
        return {
          state: 'checking',
          text: 'Verificando...',
          icon: '🔄',
          color: '#17a2b8',
          disabled: true
        };
    }
  }

  /**
   * Creates a validation message for mileage validation
   */
  createMileageValidationMessage(
    currentMileage: number,
    databaseMileage: number
  ): ValidationMessage {
    return {
      type: 'warning',
      message: `El kilometraje actual (${currentMileage}) es menor que el registrado en la base de datos (${databaseMileage} km)`,
      icon: '⚠️'
    };
  }

  /**
   * Creates a success message
   */
  createSuccessMessage(message: string): ValidationMessage {
    return {
      type: 'success',
      message,
      icon: '✅'
    };
  }

  /**
   * Creates an error message
   */
  createErrorMessage(message: string): ValidationMessage {
    return {
      type: 'error',
      message,
      icon: '❌'
    };
  }

  /**
   * Creates an info message
   */
  createInfoMessage(message: string): ValidationMessage {
    return {
      type: 'info',
      message,
      icon: 'ℹ️'
    };
  }

  /**
   * Formats currency values consistently
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Formats date consistently
   */
  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  }

  /**
   * Debounce utility for form changes
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Creates processing steps with consistent formatting
   */
  createProcessingStep(
    action: string,
    entity: string,
    icon: string = '⚙️'
  ): string {
    return `${icon} ${action} ${entity}...`;
  }

  /**
   * Common processing steps
   */
  getCommonProcessingSteps() {
    return {
      clientFound: '✅ Cliente encontrado',
      vehicleFound: '✅ Vehículo encontrado',
      creatingClient: '➕ Creando cliente...',
      addingVehicle: '➕ Agregando vehículo...',
      updatingMileage: '🔄 Actualizando kilometraje...',
      generatingInvoice: '📄 Generando factura...',
      completed: '✅ Proceso completado'
    };
  }
}
