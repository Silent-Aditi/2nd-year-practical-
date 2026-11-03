// Part A: HTTP Module and Server Creation (no Express)
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory book store
const books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", price: 350 },
  { id: 2, title: "Atomic Habits", author: "James Clear", price: 499 },
  { id: 3, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", price: 299 },
];

// Helper to send JSON responses
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
};

// Helper to send HTML responses
const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
};

// Validate the required book fields: id, title, author, price
const validateBook = (book) => {
  const errors = [];
  if (book === null || typeof book !== "object" || Array.isArray(book)) {
    return ["Request body must be a JSON object"];
  }
  if (book.id === undefined || !Number.isInteger(Number(book.id))) {
    errors.push("id is required and must be an integer");
  }
  if (!book.title || typeof book.title !== "string") {
    errors.push("title is required and must be a string");
  }
  if (!book.author || typeof book.author !== "string") {
    errors.push("author is required and must be a string");
  }
  if (book.price === undefined || isNaN(Number(book.price)) || Number(book.price) < 0) {
    errors.push("price is required and must be a non-negative number");
  }
  return errors;
};

const server = http.createServer((req, res) => {
  const { method } = req;
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  // Route: /  -> welcome message in HTML
  if (pathname === "/" && method === "GET") {
    return sendHtml(
      res,
      200,
      `<h1>Welcome to the Library Book Management System</h1>
       <p>Available routes: <a href="/books">/books</a>, <a href="/about">/about</a>, <a href="/home">/home</a></p>`
    );
  }

  // Route: GET /books -> list of books in JSON
  if (pathname === "/books" && method === "GET") {
    return sendJson(res, 200, { count: books.length, books });
  }

  // Route: /about -> application info
  if (pathname === "/about" && method === "GET") {
    return sendJson(res, 200, {
      application: "Library Book Management Web Application",
      version: "1.0.0",
      description: "Manages library books using the Node.js HTTP and FS modules",
      technologies: ["Node.js", "HTTP Module", "FS Module"],
    });
  }

  // Route: /home -> serve public/index.html using the FS module
  if (pathname === "/home" && method === "GET") {
    const filePath = path.join(__dirname, "public", "index.html");
    return fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading index.html:", err.message);
        return sendHtml(res, 500, "<h1>500 - Internal Server Error</h1><p>Unable to load the home page.</p>");
      }
      sendHtml(res, 200, data);
    });
  }

  // Route: POST /add-book -> add a new book
  if (pathname === "/add-book" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      let newBook;
      try {
        newBook = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON format" });
      }

      const errors = validateBook(newBook);
      if (errors.length > 0) {
        return sendJson(res, 400, { error: "Validation failed", details: errors });
      }

      const bookId = Number(newBook.id);
      if (books.some((book) => book.id === bookId)) {
        return sendJson(res, 409, { error: `Book with id ${bookId} already exists` });
      }

      const book = {
        id: bookId,
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        price: Number(newBook.price),
      };
      books.push(book);
      sendJson(res, 201, { message: "Book added successfully", book });
    });
    req.on("error", () => sendJson(res, 400, { error: "Invalid request" }));
    return;
  }

  // Known route but unsupported method
  const knownRoutes = ["/", "/books", "/about", "/home", "/add-book"];
  if (knownRoutes.includes(pathname)) {
    return sendJson(res, 405, { error: `Method ${method} not allowed on ${pathname}` });
  }

  // Invalid route
  sendJson(res, 404, { error: "404 - Route not found", path: pathname });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
