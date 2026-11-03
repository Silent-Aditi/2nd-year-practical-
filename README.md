# MT1-LABEXAM – Library Book Management Web Application

A Library Book Management Web Application built with **Node.js** (HTTP & FS modules) and **Express.js**.
No database is used — book records are stored in a JavaScript array.

## Project Structure

```
MT1-LABEXAM/
├── package.json
├── httpServer.js      # Part A – HTTP module + FS module (port 3000)
├── expressApp.js      # Part B – Express.js REST API (port 4000)
├── public/
│   └── index.html     # Served at /home using the FS module
└── screenshots/
```

## Setup

```bash
npm install
```

## Part A – HTTP Server (port 3000)

```bash
node httpServer.js
# HTTP Server running at http://localhost:3000
```

| Method | Route       | Response                                  |
|--------|-------------|-------------------------------------------|
| GET    | `/`         | Welcome message (HTML)                    |
| GET    | `/books`    | List of books (JSON)                      |
| GET    | `/about`    | Library application information (JSON)    |
| GET    | `/home`     | `public/index.html` served via FS module  |
| POST   | `/add-book` | Add a book (`id`, `title`, `author`, `price`) |

Invalid routes return `404`; invalid JSON / missing fields return `400`.

## Part B – Express REST API (port 4000)

```bash
node expressApp.js
# Express Server running at http://localhost:4000
```

| Method | Endpoint     | Functionality      |
|--------|--------------|--------------------|
| GET    | `/books`     | Retrieve all books |
| GET    | `/books/:id` | Retrieve a book by ID |
| POST   | `/books`     | Add a new book (201) |
| PUT    | `/books/:id` | Update book details |
| DELETE | `/books/:id` | Delete a book      |

Missing books return `404`; invalid IDs, bodies or JSON return `400`.

### Sample POST body

```json
{
  "id": 4,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "price": 550,
  "category": "Programming"
}
```

Response (`201 Created`):

```json
{
  "message": "Book added successfully",
  "book": { "id": 4, "title": "Clean Code", "author": "Robert C. Martin", "price": 550, "category": "Programming" }
}
```

## Technologies

Node.js (ES Modules), HTTP module, FS module, Express.js
