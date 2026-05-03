import { Component, Input, inject } from '@angular/core';
import { Book } from '../book.model';
import { BookService } from '../book.service';

/**
 * BookListComponent — visualizza la lista dei libri.
 *
 * Concetti Angular dimostrati:
 *  - @Input()   → riceve i dati dal componente padre (AppComponent)
 *  - @for       → nuova sintassi Angular 17 per iterare sugli array
 *  - @if        → nuova sintassi Angular 17 per la renderizzazione condizionale
 *  - [class]    → property binding per classi CSS dinamiche
 *  - (click)    → event binding per i pulsanti
 */
@Component({
  selector: 'app-book-list',
  standalone: true,
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css',
})
export class BookListComponent {

  // Il padre passa l'array corrente tramite [books]="books()"
  @Input() books: Book[] = [];

  private bookService = inject(BookService);

  toggleRead(id: string): void {
    this.bookService.toggleRead(id);
  }

  removeBook(id: string): void {
    this.bookService.removeBook(id);
  }
}
