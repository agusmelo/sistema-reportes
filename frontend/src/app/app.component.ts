import { Component } from '@angular/core';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, InvoiceFormComponent, InvoiceListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Sistema de Reportes';
  currentView: 'form' | 'list' = 'form';

  showForm(): void {
    this.currentView = 'form';
  }

  showList(): void {
    this.currentView = 'list';
  }
}
