/**
 * Modello dati per un singolo libro.
 * Questa interfaccia viene usata in tutta l'applicazione.
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  read: boolean;
  createdAt: number;
}
