// Part B: Library Management REST API using Express.js
import express from "express";

const app = express();
const PORT = 4000;

// JSON parsing middleware
app.use(express.json());

// In-memory book store with sample records
let books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", price: 350, category: "Fiction" },
  { id: 2, title: "Atomic Habits", author: "James Clear", price: 499, category: "Self-Help" },
  { id: 3, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", price: 299, category: "Biography" },
];

// Validate book fields; when partial is true only the provided fields are checked (for PUT)
const validateBook = (book, partial = false) => {
  const errors = [];
  if (!partial || book.title !== undefined) {
    if (!book.title || typeof book.title !== "string") errors.push("title is required and must be a string");
  }
  if (!partial || book.author !== undefined) {
    if (!book.author || typeof book.author !== "string") errors.push("author is required and must be a string");
  }
  if (!partial || book.price !== undefined) {
    if (book.price === undefined || isNaN(Number(book.price)) || Number(book.price) < 0) {
      errors.push("price is required and must be a non-negative number");
    }
  }
  if (book.category !== undefined && typeof book.category !== "string") {
    errors.push("category must be a string");
  }
  return errors;
};

// Parse and validate the :id route parameter
const parseId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Book id must be a positive integer" });
    return null;
  }
  return id;
};

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Library Management REST API",
    endpoints: ["GET /books", "GET /books/:id", "POST /books", "PUT /books/:id", "DELETE /books/:id"],
  });
});

// GET /books - retrieve all books
app.get("/books", (req, res) => {
  res.status(200).json(books);
});

// GET /books/:id - retrieve a book by id
app.get("/books/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  res.status(200).json(book);
});

// POST /books - add a new book
app.post("/books", (req, res) => {
  const newBook = req.body;
  if (!newBook || typeof newBook !== "object" || Array.isArray(newBook)) {
    return res.status(400).json({ error: "Request body must be a JSON object" });
  }

  const errors = validateBook(newBook);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // Use the provided id or generate the next one
  let id;
  if (newBook.id !== undefined) {
    id = Number(newBook.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }
    if (books.some((b) => b.id === id)) {
      return res.status(409).json({ error: `Book with id ${id} already exists` });
    }
  } else {
    id = books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;
  }

  const book = {
    id,
    title: newBook.title.trim(),
    author: newBook.author.trim(),
    price: Number(newBook.price),
    category: newBook.category ? newBook.category.trim() : "General",
  };
  books.push(book);
  res.status(201).json({ message: "Book added successfully", book });
});

// PUT /books/:id - update book details
app.put("/books/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }

  const updates = req.body;
  if (!updates || typeof updates !== "object" || Array.isArray(updates) || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Request body must be a non-empty JSON object" });
  }

  const errors = validateBook(updates, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const current = books[index];
  books[index] = {
    ...current,
    title: updates.title !== undefined ? updates.title.trim() : current.title,
    author: updates.author !== undefined ? updates.author.trim() : current.author,
    price: updates.price !== undefined ? Number(updates.price) : current.price,
    category: updates.category !== undefined ? updates.category.trim() : current.category,
  };
  res.status(200).json({ message: "Book updated successfully", book: books[index] });
});

// DELETE /books/:id - delete a book
app.delete("/books/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  books = books.filter((b) => b.id !== id);
  res.status(200).json({ message: "Book deleted successfully", book });
});

// 404 handler for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "404 - Route not found", path: req.originalUrl });
});

// Error handler (e.g. malformed JSON body)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON format in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
