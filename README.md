# 🌍 Wanderlust

A full-stack **Node.js** application inspired by Airbnb that lets travellers browse, create, review, and manage vacation rental listings. The project uses **Express**, **MongoDB**, and **EJS templates** to deliver a server-rendered experience with session-backed authentication and image uploads powered by **Cloudinary**.

---

## ✨ Features

* 🏡 Listing catalogue with **create, read, update, delete (CRUD)** flows and server-side validation via **Joi**.
* 🔐 Authenticated workflows using **Passport** local strategy, persistent sessions, and flash messaging for user feedback.
* ⭐ Review system that attaches **ratings and comments** to listings, including ownership checks before editing or deleting.
* 📸 Image uploads handled with **Multer + Cloudinary**, with defensive fallbacks for missing assets.
* 🌱 Seed script that bootstraps demo listings and attaches them to a pre-configured owner account.

---

## 🧰 Tech Stack

* ⚙️ Node.js, Express 5, EJS, EJS-Mate layout engine
* 🗃️ MongoDB with Mongoose ODM
* 🔑 Passport, express-session, connect-flash for authentication and UX
* ☁️ Multer, Cloudinary Storage for media handling
* ✅ Joi for request validation, custom Express error handling utilities

---

## 🚀 Getting Started

### 🧩 Prerequisites

* 📦 Node.js 18+
* 🍃 MongoDB instance (local or hosted)
* ☁️ Cloudinary account for image storage

---

### 🛠️ Installation

```bash
npm install
```

### ▶️ Run the App

```bash
node app.js
```

The server boots on **[http://localhost:8000](http://localhost:8000)** by default.
💡 For live reload during development, consider adding a script that runs `nodemon app.js`.

---

## 🗂️ Project Structure

```
app.js                # Express bootstrap, middleware, route mounting, error handling
cloudConfig.js        # Cloudinary + Multer storage configuration
middleware.js         # Auth guards, validation helpers
schema.js             # Joi validation schemas
controllers/          # Request handlers (listings)
models/               # Mongoose models for listings, reviews, users
routes/               # Express routers for listings, reviews, auth
utils/                # ExpressError class, async wrapper
views/                # EJS templates (layouts, listings, auth pages)
public/               # Static assets (CSS, client-side JS)
init/                 # Seed data and seeding bootstrap script
```

---

## 🧾 Useful Commands

* 🪄 `npm install` – install dependencies
* ▶️ `node app.js` – start the application server
* 🌱 `node .\init\index.js` – seed listings database

---

## 👩‍💻 Author

**`Gauri Shirke`** ✨
