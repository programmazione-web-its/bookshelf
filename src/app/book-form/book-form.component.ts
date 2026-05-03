import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookService } from '../book.service';

/**
 * BookFormComponent — form per aggiungere un nuovo libro.
 *
 * Concetti Angular dimostrati:
 *  - FormsModule / [(ngModel)]  → two-way binding sul valore degli input
 *  - @Output / EventEmitter     → comunica un evento al componente padre
 *  - Validazione inline         → errorMessage mostrato con @if nel template
 */
@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [FormsModule],   // ← necessario per [(ngModel)]
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.css',
})
export class BookFormComponent {

  // Notifica il padre quando un libro viene aggiunto (utile se il padre
  // deve fare qualcosa in risposta, es. scroll alla lista)
  @Output() bookAdded = new EventEmitter<void>();

  private bookService = inject(BookService);

  // Campi del form — legati al template tramite [(ngModel)]
  title  = '';
  author = '';
  genre  = '';

  // Messaggio di errore inline (vuoto = nascosto)
  errorMessage = '';

  onSubmit(): void {
    if (!this.title.trim()) {
      this.errorMessage = 'Il titolo è obbligatorio.';
      return;
    }

    this.errorMessage = '';
    this.bookService.addBook(this.title, this.author, this.genre);
    this.bookAdded.emit();

    // Reset campi
    this.title  = '';
    this.author = '';
    this.genre  = '';
  }
}
