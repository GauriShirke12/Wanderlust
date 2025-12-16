# 🌍 Wanderlust

A full-stack Node.js application that allows travelers to browse, create, review, and manage vacation rental listings. Built with Express, MongoDB, and EJS templates, it delivers a secure, server-rendered experience with session-backed authentication, Cloudinary image uploads, and intelligent guest support via a built-in chatbot and interactive analytics dashboard.

---

 # 🌐 Website Live Here: 
 
   [[ click on My Live Website Here]](https://wanderlust-kns9.onrender.com/listings)

---

## ✨ Features

* 🏡 Listings Catalogue: Full create, read, update, and delete (CRUD) workflows with robust server-side validation using Joi.
* 🔐 User Authentication: Secure login and registration via Passport local strategy, with persistent sessions, flash messages, and redirect handling.
* ⭐ Review System: Ratings and comments attached to listings, with ownership verification for editing or deletion and cascading cleanup on listing removal.
* 📸 Image Uploads: Integrated Multer + Cloudinary for media management, including defensive fallbacks for missing assets.
* 💬 Intelligent Chatbot: On-page conversational assistant that summarizes listing details and answers FAQs about pricing, availability, and host information.
* 📊 Analytics Dashboard: Visualizes key performance indicators such as listing distribution, average pricing, and review sentiment using Chart.js.

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
