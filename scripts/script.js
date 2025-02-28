import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import { loadBooks, initializeModals, showEditModal, showDeleteModal, addBook } from "./operations.js";
import { filterAndDisplayBooks } from "./bookFilter.js";
import { initializeChatbot, askChatBot, handleLocalCommands } from "./chat.js";

initializeChatbot();

document.addEventListener("DOMContentLoaded", () => {
  initializeModals();

  // Grab DOM elements
  const chatHistory = document.getElementById("chat-history");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const bookList = document.getElementById("bookList");
  const organizeBySelect = document.getElementById("organizeBy");
  const bookForm = document.getElementById("bookForm");
  const searchBar = document.getElementById("searchBar");
  const filterGenre = document.getElementById("filterGenre");
  const chatWidget = document.getElementById("chat-widget");
  const chatCircle = document.getElementById("chat-circle");
  const closeBtn = document.getElementById("chat-close-btn");


  // --- Chat UI Logic ---
  function appendMessage(text, sender = "bot") {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", sender === "user" ? "user-message" : "bot-message");
    msgDiv.textContent = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  sendBtn.addEventListener("click", async () => {
    const userInput = chatInput.value.trim();
    if (!userInput) return;
    appendMessage(userInput, "user");
    chatInput.value = "";

    const handled = await handleLocalCommands(userInput, appendMessage);
    if (handled) return;

    const botReply = await askChatBot(userInput);
    appendMessage(botReply, "bot");
  });

  chatInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  // --- Book Form Logic with Validation ---
  if (bookForm) {
    bookForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Clear previous error messages
      document.querySelectorAll(".error-message").forEach(msg => msg.textContent = "");

      let valid = true;
      const title = document.getElementById("title").value.trim();
      const author = document.getElementById("author").value.trim();
      const genre = document.getElementById("genre").value;
      const rating = document.getElementById("rating").value.trim();

      // Validate Title
      if (!title) {
        document.getElementById("titleError").textContent = "Title is required";
        valid = false;
      }
      // Validate Author
      if (!author) {
        document.getElementById("authorError").textContent = "Author is required";
        valid = false;
      }
      // Validate Genre
      if (!genre) {
        document.getElementById("genreError").textContent = "Please select a genre";
        valid = false;
      }
      // Validate Rating: must be a number between 1 and 10
      const ratingValue = parseFloat(rating);
      if (!rating) {
        document.getElementById("ratingError").textContent = "Rating is required";
        valid = false;
      } else if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
        document.getElementById("ratingError").textContent = "Rating must be between 1 and 10";
        valid = false;
      }
      
      if (!valid) return; // Stop if validation fails

      await addBook(title, author, genre, rating);
      bookForm.reset();
    });
  }

  // --- Book List Logic (Edit/Delete) ---
  bookList.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const bookId = e.target.getAttribute("data-id");
      showEditModal(bookId);
    } else if (e.target.classList.contains("delete-btn")) {
      const bookId = e.target.getAttribute("data-id");
      showDeleteModal(bookId);
    }
  });

  if (organizeBySelect) {
    organizeBySelect.addEventListener("change", () => {
      loadBooks();
    });
  }

  // --- Filter Logic ---
  async function applyFilters() {
    const searchText = searchBar.value.toLowerCase();
    const selectedGenre = filterGenre.value;
    await filterAndDisplayBooks(searchText, selectedGenre, bookList);
  }

  if (searchBar) {
    searchBar.addEventListener("input", applyFilters);
  }
  if (filterGenre) {
    filterGenre.addEventListener("change", applyFilters);
  }

  // --- Chat Widget Logic ---
  chatCircle.addEventListener("click", () => {
    chatWidget.classList.toggle("chat-widget-open");
  });
  closeBtn.addEventListener("click", () => {
    chatWidget.classList.remove("chat-widget-open");
  });

  // --- onAuthStateChanged ---
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User signed in:", user.email);
      loadBooks();
    } else {
      console.log("No user is signed in");
      // Optionally redirect to the sign-in page
      // window.location.href = "index.html";
    }
  });

  applyFilters();

  // --- Sign Out Flow with Confirmation Modal ---
  signOutBttn.addEventListener("click", () => {
    signOutModal.style.display = "block";
  });

  confirmSignOut.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  });

  cancelSignOut.addEventListener("click", () => {
    signOutModal.style.display = "none";
  });
});
