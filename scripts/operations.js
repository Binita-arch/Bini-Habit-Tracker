import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, query, where } from "firebase/firestore";
import { db, auth } from "./firebase.js";

// Global modal variables
let editModal, editForm, closeModalBtn;
let deleteModal, confirmDeleteBtn, cancelDeleteBtn;
let currentBookId = null;
let currentDeleteBookId = null;

// Function to add a book
export async function addBook(title, author, genre, rating) {
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not authenticated");
    return false;
  }
  try {
    await addDoc(collection(db, "books"), { 
      title, 
      author, 
      genre, 
      rating, 
      email: user.email.toLowerCase() 
    });
    await loadBooks();
    return true;
  } catch (error) {
    console.error("Error adding book:", error);
    return false;
  }
}

// Function to edit a book
export async function editBook(oldTitle, newTitle, newAuthor, newGenre, newRating) {
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not signed in");
    return false;
  }
  try {
    const booksCollection = collection(db, "books");
    const snapshot = await getDocs(booksCollection);
    const bookDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.title.toLowerCase() === oldTitle.toLowerCase() && data.email === user.email.toLowerCase();
    });
    if (bookDoc) {
      await updateDoc(doc(db, "books", bookDoc.id), {
        title: newTitle,
        author: newAuthor,
        genre: newGenre,
        rating: newRating,
      });
      await loadBooks();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error editing book:", error);
    return false;
  }
}

// Function to delete a book by title
export async function deleteBookByTitle(title) {
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not signed in");
    return false;
  }
  try {
    const booksCollection = collection(db, "books");
    const snapshot = await getDocs(booksCollection);
    const bookDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.title.toLowerCase() === title.toLowerCase() && data.email === user.email.toLowerCase();
    });
    if (bookDoc) {
      await deleteDoc(doc(db, "books", bookDoc.id));
      await loadBooks();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting book:", error);
    return false;
  }
}

// Function to load all books for the current user
export async function loadBooks() {
  const bookList = document.getElementById("bookList");
  const sidebarContainer = document.getElementById("sidebarContainer");
  const sidebarTitle = document.getElementById("sidebarTitle");
  const myBooksHeading = document.getElementById("myBooksHeading");
  const bookListSection = document.getElementById("book-list-section");
  const organizeBySelect = document.getElementById("organizeBy");

  if (!bookList) return;

  const user = auth.currentUser;
  if (!user) {
    console.error("User is not signed in");
    return;
  }

  try {
    // Fetch the user's books from Firestore
    const booksCollection = collection(db, "books");
    const q = query(booksCollection, where("email", "==", user.email.toLowerCase()));
    const snapshot = await getDocs(q);
    let allBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sorting logic if user selected an "organize by" option
    if (organizeBySelect) {
      const criteria = organizeBySelect.value;
      if (criteria === "genre") {
        allBooks = allBooks.sort((a, b) => a.genre.localeCompare(b.genre));
      } else if (criteria === "author") {
        allBooks = allBooks.sort((a, b) => a.author.localeCompare(b.author));
      }
    }

    // Clearing the existing list
    bookList.innerHTML = "";

    //If there are no books, hide the containers; otherwise show them
    if (allBooks.length === 0) {
      // Hide the entire sidebar
      if (sidebarContainer) sidebarContainer.style.display = "none";

      // Hide "My Books" heading and container
      if (myBooksHeading) myBooksHeading.style.display = "none";
      if (bookListSection) bookListSection.style.display = "none";
    } else {
      // Show the sidebar, heading, and container if they were hidden
      if (sidebarContainer) sidebarContainer.style.display = "block";
      if (myBooksHeading) myBooksHeading.style.display = "block";
      if (bookListSection) bookListSection.style.display = "block";

      // Display each book in the list
      allBooks.forEach(book => {
        displayBook(book, bookList);
      });
    }
  } catch (error) {
    console.error("Error loading books:", error);
  }
}

// Function to display a book in the UI
export function displayBook(book, bookList) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span><strong>${book.title}</strong> by ${book.author} (${book.genre}) Rate-${book.rating}</span>
    <button class="edit-btn" data-id="${book.id}">Edit</button>
    <button class="delete-btn" data-id="${book.id}">Delete</button>
  `;
  bookList.appendChild(li);
}

// Modal functions
export function initializeModals() {
  editModal = document.getElementById("editModal");
  editForm = document.getElementById("editForm");
  closeModalBtn = document.querySelector(".close-btn");
  
  deleteModal = document.getElementById("deleteModal");
  confirmDeleteBtn = document.getElementById("confirmDelete");
  cancelDeleteBtn = document.getElementById("cancelDelete");
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideEditModal);
  }
  
  window.addEventListener("click", (event) => {
    if (event.target === editModal) hideEditModal();
    if (event.target === deleteModal) hideDeleteModal();
  });
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      if (currentDeleteBookId) {
        await deleteBook(currentDeleteBookId);
        currentDeleteBookId = null;
      }
      hideDeleteModal();
    });
  }
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      currentDeleteBookId = null;
      hideDeleteModal();
    });
  }
  
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const updatedTitle = document.getElementById("editTitle").value.trim();
      const updatedAuthor = document.getElementById("editAuthor").value.trim();
      const updatedGenre = document.getElementById("editGenre").value;
      const updatedRating = document.getElementById("editRating").value;
      try {
        await updateDoc(doc(db, "books", currentBookId), {
          title: updatedTitle,
          author: updatedAuthor,
          genre: updatedGenre,
          rating: updatedRating,
        });
        hideEditModal();
        await loadBooks();
      } catch (error) {
        console.error("Error updating book:", error);
      }
    });
  }
}

// edit book modal
export function showEditModal(bookId) {
  getDoc(doc(db, "books", bookId))
    .then((docSnap) => {
      if (docSnap.exists()) {
        const bookData = docSnap.data();
        currentBookId = bookId;
        document.getElementById("editTitle").value = bookData.title;
        document.getElementById("editAuthor").value = bookData.author;
        document.getElementById("editGenre").value = bookData.genre;
        document.getElementById("editRating").value = bookData.rating;
        if (editModal) {
          editModal.style.display = "block";
        }
      } else {
        console.log("Book doesn't exist!");
      }
    })
    .catch((error) => {
      console.error("Error fetching book for edit:", error);
    });
}

export function hideEditModal() {
  if (editModal) {
    editModal.style.display = "none";
  }
}

export function showDeleteModal(bookId) {
  currentDeleteBookId = bookId;
  if (deleteModal) {
    deleteModal.style.display = "block";
  }
}

export function hideDeleteModal() {
  if (deleteModal) {
    deleteModal.style.display = "none";
  }
}

// Helper function to delete a book by ID (used by modal handlers)
async function deleteBook(bookId) {
  try {
    await deleteDoc(doc(db, "books", bookId));
    await loadBooks();
    return true;
  } catch (error) {
    console.error("Error deleting book:", error);
    return false;
  }
}