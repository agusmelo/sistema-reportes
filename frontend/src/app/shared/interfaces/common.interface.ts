// Shared interfaces for reusable components
export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: string;
  cancelIcon?: string;
}

export interface DetailItem {
  label: string;
  value: string | number;
  icon?: string;
}

export interface DetailSection {
  title: string;
  icon?: string;
  items: DetailItem[];
}

export interface ButtonState {
  state: 'green' | 'yellow' | 'orange' | 'disabled' | 'checking' | 'processing';
  text: string;
  icon: string;
  color: string;
  disabled: boolean;
}

export interface ValidationMessage {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  icon?: string;
}

export interface StateIndicatorInfo {
  state: 'green' | 'yellow' | 'orange' | 'disabled' | 'checking';
  message: string;
  icon?: string;
  color?: string;
}
