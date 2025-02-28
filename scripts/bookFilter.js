import { collection, getDocs, where, query} from "firebase/firestore";
import { db, auth } from "./firebase.js";

export async function filterAndDisplayBooks(searchText, selectedGenre, bookList) {
  //ensuring user is signed in
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not signed in");
    return;
  }
  try {
    const booksCollection = collection(db, "books");
    const q = query(booksCollection, where("email", "==", user.email.toLowerCase()));
    const snapshot = await getDocs(q);
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // If no filters, show all books:
    const filteredBooks = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchText) ||
                            book.author.toLowerCase().includes(searchText);
      const matchesGenre = selectedGenre ? book.genre === selectedGenre : true;
      return matchesSearch && matchesGenre;
    });

    // Clearing the list
    bookList.innerHTML = "";

    // Directly updating the DOM
    filteredBooks.forEach(book => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span><strong>${book.title}</strong> by ${book.author} (${book.genre}) Rating${book.rating}</span>
        <button class="edit-btn" data-id="${book.id}">Edit</button>
        <button class="delete-btn" data-id="${book.id}">Delete</button>
      `;
      bookList.appendChild(li);
    });
  } catch (error) {
    console.error("Error filtering books:", error);
  }
}
