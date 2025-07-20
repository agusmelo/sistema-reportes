import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-searchable-select',
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-select.component.html',
  styleUrl: './searchable-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true
    }
  ]
})
export class SearchableSelectComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() options: string[] = [];
  @Output() selectionChange = new EventEmitter<string>();

  value: string = '';
  filteredOptions: string[] = [];
  isOpen: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.filteredOptions = this.options;
  }

  ngOnChanges() {
    this.filterOptions();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInputChange(): void {
    this.filterOptions();
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  onInputFocus(): void {
    this.isOpen = true;
    this.filterOptions();
  }

  onInputBlur(): void {
    // Delay to allow option selection
    setTimeout(() => {
      this.isOpen = false;
      this.onTouched();
    }, 200);
  }

  selectOption(option: string): void {
    this.value = option;
    this.isOpen = false;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  clearField(): void {
    this.value = '';
    this.isOpen = false;
    this.filterOptions();
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  private filterOptions(): void {
    if (!this.value) {
      this.filteredOptions = this.options;
    } else {
      this.filteredOptions = this.options.filter(option =>
        option.toLowerCase().includes(this.value.toLowerCase())
      );
    }
  }
}
