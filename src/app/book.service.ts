import { Injectable, signal, computed } from '@angular/core';
import { Book } from './book.model';

const STORAGE_KEY = 'bookshelf-angular';

/**
 * BookService — gestisce lo stato globale dei libri.
 *
 * Concetti Angular dimostrati:
 *  - signal<T>()    → stato reattivo (sostituisce BehaviorSubject per casi semplici)
 *  - computed()     → valore derivato che si ricalcola automaticamente
 *  - providedIn: 'root' → singleton disponibile in tutta l'app
 */
@Injectable({ providedIn: 'root' })
export class BookService {

  // ── Stato privato (scrivibile solo dall'interno del service) ──
  private readonly _books = signal<Book[]>(this._loadFromStorage());

  // ── API pubblica (sola lettura per i componenti) ──────────────

  /** Lista completa dei libri — segnale in sola lettura */
  readonly books = this._books.asReadonly();

  /** Numero totale di libri — si aggiorna automaticamente */
  readonly totalCount = computed(() => this._books().length);

  /** Numero di libri già letti — calcolato con .filter() */
  readonly readCount = computed(
    () => this._books().filter(b => b.read).length
  );

  // ── Metodi ───────────────────────────────────────────────────

  /** Aggiunge un nuovo libro all'array. */
  addBook(title: string, author: string, genre: string): void {
    const book: Book = {
      id:        crypto.randomUUID(),
      title:     title.trim(),
      author:    author.trim() || 'Autore sconosciuto',
      genre:     genre || 'altro',
      read:      false,
      createdAt: Date.now(),
    };
    // .update() riceve la funzione (vecchioValore => nuovoValore)
    this._books.update(books => [...books, book]);
    this._saveToStorage();
  }

  /** Rimuove un libro dato l'id. Usa .filter() */
  removeBook(id: string): void {
    this._books.update(books => books.filter(b => b.id !== id));
    this._saveToStorage();
  }

  /** Alterna lo stato letto/da leggere. Usa .map() */
  toggleRead(id: string): void {
    this._books.update(books =>
      books.map(b => b.id === id ? { ...b, read: !b.read } : b)
    );
    this._saveToStorage();
  }

  /**
   * Carica in blocco una lista di libri (es. dall'API).
   * Chiamato da AppComponent al bootstrap se il localStorage è vuoto.
   */
  initBooks(raw: Book[]): void {
    this._books.set(raw);
    this._saveToStorage();
  }

  // ── Persistenza ───────────────────────────────────────────────
  private _saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._books()));
  }

  private _loadFromStorage(): Book[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  }
}
