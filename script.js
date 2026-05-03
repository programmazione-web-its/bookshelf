// ═══════════════════════════════════════════════════════════════
//  BookShelf — script.js
//  Struttura dati: { id, title, author, genre, read, createdAt }
// ═══════════════════════════════════════════════════════════════

// ── 1. STATO ─────────────────────────────────────────────────
/** @type {Array<{id:string, title:string, author:string, genre:string, read:boolean, createdAt:number}>} */
let books = []

// ── 2. PERSISTENZA (localStorage) ────────────────────────────
const STORAGE_KEY = 'bookshelf-data'

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

// ── 3. LOGICA ─────────────────────────────────────────────────

/**
 * Aggiunge un libro all'array e aggiorna la UI.
 * Usa lo spread operator per mantenere l'immutabilità dell'array.
 */
function addBook(title, author, genre) {
  const book = {
    id: crypto.randomUUID(),
    title: title.trim(),
    author: author.trim() || 'Autore sconosciuto',
    genre: genre || 'altro',
    read: false,
    createdAt: Date.now(),
  }
  books = [...books, book] // .concat() / spread — non muta l'originale
  saveToStorage()
  render()
}

/**
 * Rimuove un libro dato il suo id.
 * Usa .filter() che restituisce un nuovo array senza il libro eliminato.
 */
function removeBook(id) {
  books = books.filter((b) => b.id !== id) // .filter()
  saveToStorage()
  render()
}

/**
 * Alterna lo stato letto/da leggere di un libro.
 * Usa .map() che restituisce un nuovo array con il libro aggiornato.
 */
function toggleRead(id) {
  books = books.map((b) => (b.id === id ? { ...b, read: !b.read } : b)) // .map()
  saveToStorage()
  render()
}

// ── 4. RENDER ─────────────────────────────────────────────────

/**
 * Ri-renderizza l'intera lista partendo dall'array `books`.
 * Viene chiamata ogni volta che lo stato cambia.
 */
function render() {
  const bookList = document.querySelector('#book-list')
  const emptyState = document.querySelector('#empty-state')
  const counter = document.querySelector('#count')

  // Aggiorna il contatore
  counter.textContent = books.length

  // Gestisce lo stato vuoto
  if (books.length === 0) {
    emptyState.classList.remove('hidden')
    bookList.innerHTML = ''
    return
  }
  emptyState.classList.add('hidden')

  // Genera l'HTML per ogni libro tramite .map() e lo unisce
  bookList.innerHTML = books
    .map(
      (book) => `
      <li class="book-item${book.read ? ' read' : ''}" data-id="${book.id}">
        <div class="book-info">
          <p class="book-title">${escapeHtml(book.title)}</p>
          <p class="book-author">di ${escapeHtml(book.author)}</p>
        </div>
        <span class="badge badge-${book.genre}">${book.genre}</span>
        <div class="book-actions">
          <button class="btn-toggle ${book.read ? 'read' : 'unread'}">
            ${book.read ? '✓ Letto' : '○ Da leggere'}
          </button>
          <button class="btn-delete" aria-label="Elimina libro">🗑️</button>
        </div>
      </li>
    `,
    )
    .join('')

  // Collega gli event listener ai pulsanti appena creati
  bookList.querySelectorAll('.book-item').forEach((li) => {
    const id = li.dataset.id
    li.querySelector('.btn-toggle').addEventListener('click', () =>
      toggleRead(id),
    )
    li.querySelector('.btn-delete').addEventListener('click', () =>
      removeBook(id),
    )
  })
}

// ── 5. UTILITIES ────────────────────────────────────────────────

/** Previene XSS sanificando i caratteri speciali HTML. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function showError(msg) {
  const el = document.querySelector('#form-error')
  el.textContent = msg
  el.classList.remove('hidden')
}

function hideError() {
  document.querySelector('#form-error').classList.add('hidden')
}

// ── 6. CARICAMENTO INIZIALE DA OPEN LIBRARY API ───────────────

async function loadInitialBooks() {
  try {
    const res = await fetch(
      'https://openlibrary.org/search.json?q=fiction&limit=10',
    )
    const data = await res.json()

    return data.docs.map((doc) => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] ?? 'Autore sconosciuto',
      genre: 'fiction',
      read: false,
      createdAt: Date.now(),
    }))
  } catch (err) {
    console.error('Errore nel caricamento dei libri:', err)
    return []
  }
}

// ── 7. INIZIALIZZAZIONE ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Carica da localStorage; se vuoto, recupera dall'API
  const stored = loadFromStorage()
  if (stored && stored.length > 0) {
    books = stored
  } else {
    books = await loadInitialBooks()
    saveToStorage()
  }
  render()

  // ── Form: aggiungi libro ──────────────────────────────────
  const btnAdd = document.querySelector('#btn-add')
  const inputTitle = document.querySelector('#input-title')
  const inputAuthor = document.querySelector('#input-author')
  const inputGenre = document.querySelector('#input-genre')

  btnAdd.addEventListener('click', () => {
    const title = inputTitle.value
    const author = inputAuthor.value
    const genre = inputGenre.value

    // Validazione: titolo obbligatorio
    if (!title.trim()) {
      showError('Il titolo è obbligatorio.')
      inputTitle.focus()
      return
    }

    hideError()
    addBook(title, author, genre)

    // Reset form
    inputTitle.value = ''
    inputAuthor.value = ''
    inputGenre.value = ''
    inputTitle.focus()
  })

  // Nasconde l'errore non appena l'utente inizia a scrivere il titolo
  inputTitle
    .addEventListener('input', hideError)

    [
      // Permette di aggiungere premendo Invio dal campo titolo o autore
      (inputTitle, inputAuthor)
    ].forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnAdd.click()
      })
    })
})
