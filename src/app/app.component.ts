import { Component, OnInit, inject, signal } from '@angular/core';
import { BookService } from './book.service';
import { BookFormComponent } from './book-form/book-form.component';
import { BookListComponent } from './book-list/book-list.component';
import { Book } from './book.model';

/**
 * AppComponent — componente radice dell'applicazione.
 *
 * Concetti Angular dimostrati:
 *  - inject()      → dependency injection funzionale (Angular 14+)
 *  - computed()    → totalCount è un computed() definito nel service
 *  - OnInit        → lifecycle hook per il caricamento iniziale dall'API
 *  - standalone    → non serve un NgModule; le dipendenze si dichiarano in `imports`
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookFormComponent, BookListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

  // inject() è l'alternativa moderna al constructor(private svc: BookService)
  private bookService = inject(BookService);

  // Espone il segnale al template — books() restituisce il valore corrente
  readonly books      = this.bookService.books;
  readonly totalCount = this.bookService.totalCount;
  readonly readCount  = this.bookService.readCount;

  // true mentre il fetch iniziale è in corso
  readonly isLoading = signal(false);

  async ngOnInit(): Promise<void> {
    // Se il localStorage è vuoto, precarica dall'Open Library API
    if (this.books().length === 0) {
      await this._loadFromApi();
    }
  }

  private async _loadFromApi(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res  = await fetch('https://openlibrary.org/search.json?q=fiction&limit=10');
      const data = await res.json();

      const books: Book[] = (data.docs as any[]).map(doc => ({
        id:        doc.key as string,
        title:     doc.title as string,
        author:    doc.author_name?.[0] ?? 'Autore sconosciuto',
        genre:     'fiction',
        read:      false,
        createdAt: Date.now(),
      }));

      // initBooks() carica in blocco e salva in localStorage
      this.bookService.initBooks(books);
    } catch (err) {
      console.error('Errore nel caricamento iniziale:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
