# Blog App Backend

## Overview

The Blog App Backend is a RESTful API built using Node.js and Express.js. It handles blog management, authentication, database operations, middleware processing, and secure communication between frontend and backend.

The backend follows MVC architecture and uses MongoDB Atlas for cloud database storage.

---

## Backend Development Workflow

The backend was developed using the following steps:

### 1. Project Initialization

Generate the project repository (optional):

```bash
mkdir backend && cd backend
```

---

### 2. Create .gitignore File

Create `.gitignore` to ignore unnecessary files.

Example:

```gitignore
node_modules
.env
```

---

### 3. Create Environment Variables File

Create `.env` file to store sensitive data.

Install dotenv:

```bash
npm install dotenv
```

Read environment variables:

```js
require("dotenv").config()
```

Example `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

### 4. Generate package.json

Initialize Node project:

```bash
npm init -y
```

This generates:

```bash
package.json
```

which stores dependencies, scripts, and project configuration.

---

### 5. Create Express Application

Install Express:

```bash
npm install express
```

Create Express server:

```js
const express = require("express")
const app = express()
```

---

### 6. Connect to Database

Install Mongoose:

```bash
npm install mongoose
```

Database connection:

```js
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err))
```

MongoDB Atlas is used for cloud database hosting.

---

### 7. Add Middleware

Install required middleware:

```bash
npm install cors
```

Add middleware:

```js
app.use(express.json())
app.use(cors())
```

Middleware used:

| Middleware | Purpose |
|------------|---------|
| express.json() | Parse JSON request body |
| cors() | Enable frontend-backend communication |
| errorHandler | Handle API errors |
| authMiddleware | Protect private routes |

Error handling middleware example:

```js
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message
  })
})
```

---

### 8. Design Schema and Create Models

Install Mongoose:

```bash
npm install mongoose
```

Schema defines structure of database documents.

Example Blog Schema:

```js
const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model("Blog", blogSchema)
```

This schema stores:

- Blog title
- Blog content
- Author information
- Created and updated timestamps

---

### 9. Design REST APIs for Resources

REST APIs are designed for CRUD operations.

CRUD stands for:

| Operation | Method | Purpose |
|------------|--------|---------|
| Create | POST | Add new data |
| Read | GET | Retrieve data |
| Update | PUT | Modify existing data |
| Delete | DELETE | Remove data |

---

## Features

- Authentication
- CRUD Blog APIs
- Database Storage
- Error Handling
- Middleware
- Token Validation
- RESTful API Design

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv
- cors
- nodemon

---

## Frameworks and Libraries Used

| Tool | Purpose |
|------|---------|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| JWT | Token authentication |
| bcrypt | Password hashing |
| dotenv | Environment configuration |
| cors | Cross-origin access |
| nodemon | Auto restart during development |

Install packages:

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
```

Development dependency:

```bash
npm install nodemon --save-dev
```

---

## API Architecture

Backend request flow:

```text
Request → Middleware → Controller → Database → Response
```

MVC structure:

```text
Routes → Controllers → Models → Database
```

---

## Folder Structure

```bash
backend/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
├── server.js
├── package.json
├── .env
└── .gitignore
```

Folder explanation:

| Folder | Purpose |
|---------|---------|
| controllers | Business logic |
| models | Database schema |
| routes | API endpoints |
| middleware | Request processing |
| config | Database configuration |

---

## Environment Variables

Required environment variables:

```env
PORT=
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
```

Explanation:

| Variable | Purpose |
|----------|---------|
| PORT | Backend server port |
| MONGO_URI | MongoDB connection |
| JWT_SECRET | JWT token secret |
| CLIENT_URL | Frontend URL |

---

## Installation

Obtain the project files and move into the backend folder.

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## Run Server

Development mode:

```bash
npm run dev
```

Production:

```bash
npm start
```

Direct execution:

```bash
node server.js
```

---

## API Endpoints

### Blog Routes

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /blogs | Fetch blogs |
| POST | /blogs | Create blog |
| PUT | /blogs/:id | Update blog |
| DELETE | /blogs/:id | Delete blog |

---

## Authentication Flow

Authentication workflow:

```text
Register → Login → JWT Token → Protected Route
```

Typical authentication routes:

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /register | Create user |
| POST | /login | Authenticate user |

JWT protects private APIs.

Example:

```js
Authorization: Bearer token
```

---

## Database Configuration

MongoDB Atlas is used for database hosting.

Connection setup:

```js
mongoose.connect(process.env.MONGO_URI)
```

Successful connection:

```bash
MongoDB Connected
```

---

## Deployment

Backend deployment using Render:

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

Deployment steps:

1. Create Render Web Service
2. Add environment variables
3. Deploy backend

---

## Error Handling

Error handling improves API reliability.

Validation includes:

- Required fields
- Invalid requests
- Authentication errors
- Database failures

Example:

```js
res.status(400).json({
  message: "Invalid Request"
})
```

---

## Future Improvements

Possible future features:

- Blog comments
- Like system
- Search functionality
- Categories and tags
- Admin dashboard
- Image uploads
- Pagination
- Role-based authorization

---

## Author

Arjun Varikuppala