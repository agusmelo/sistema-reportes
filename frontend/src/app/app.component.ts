import { Component } from '@angular/core';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';

@Component({
  selector: 'app-root',
  imports: [InvoiceFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Sistema de Reportes';
}
