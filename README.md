# 🌍 Advanced Tour Booking API

A powerful and secure Node.js RESTful API for managing tours, users, reviews, and bookings. This backend service is designed with scalability, security, and performance in mind using the **MVC pattern**, **JWT authentication**, and **MongoDB Atlas**.

---

## 🚀 Key Features

- 🔐 User Authentication & Authorization (JWT)
- 🗂️ Role-based Access Control (`admin`, `lead-guide`, `user`)
- ✍️ Create, Read, Update, Delete Tours, Users, and Reviews
- ⭐ Users can post and manage reviews on tours
- 📊 Aggregated Tour Statistics & Monthly Plans
- 🌍 Geospatial Queries (tours within radius & distance calc)
- ⚙️ Powerful Query Features (filtering, sorting, pagination)
- 📷 Image Upload & Processing for Tours and Users
- 📩 Password Reset via Email (Nodemailer)
- 🛡️ Security Middleware: `Helmet`, `Rate Limiting`, `XSS Protection`, `Mongo Sanitize`
- 🔒 Protected Routes & Request Validation

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Auth**: JSON Web Tokens (JWT)
- **Email**: Nodemailer
- **Geocoding**: Mapbox or OpenStreetMap via `node-geocoder`
- **Image Handling**: Multer, Sharp
- **Security**: Helmet, express-rate-limit, mongo-sanitize, xss-clean
- **Testing**: Postman

---

## 📁 Project Structure

```
project/
├── Controllers/
│   ├── authController.js
│   ├── tourController.js
│   ├── userController.js
│   └── reviewController.js
├── Models/
│   ├── tourModel.js
│   ├── userModel.js
│   └── reviewModel.js
├── Routers/
│   ├── toursRoutes.js
│   ├── usersRoutes.js
│   └── reviewRoutes.js
├── Utils/
│   ├── APIFeatures.js
│   ├── appError.js
│   └── sendEmail.js
├── public/
│   └── (static files, uploads, images)
├── config/
│   └── config.env
├── app.js
├── server.js
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the root:

```env
PORT=3000
NODE_ENV=development
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/natours
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=Natours Team <natours@example.com>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
GEOCODER_PROVIDER=openstreetmap
GEOCODER_API_KEY=your-api-key (if using Mapbox)
```

---

## 🚦 API Endpoints Overview

### Tours

| Method | Route                        | Access        | Description                         |
|--------|------------------------------|---------------|-------------------------------------|
| GET    | /api/v1/tours                | Public        | Get all tours                       |
| GET    | /api/v1/tours/:id            | Public        | Get a specific tour                 |
| POST   | /api/v1/tours                | Admin, Guide  | Create a new tour                   |
| PATCH  | /api/v1/tours/:id            | Admin, Guide  | Update a tour                       |
| DELETE | /api/v1/tours/:id            | Admin, Guide  | Delete a tour                       |

### Reviews

| Method | Route                               | Access   | Description              |
|--------|--------------------------------------|----------|--------------------------|
| GET    | /api/v1/reviews                      | Public   | Get all reviews          |
| POST   | /api/v1/tours/:tourId/reviews        | User     | Post a review on a tour  |
| PATCH  | /api/v1/reviews/:id                  | User     | Update a review          |
| DELETE | /api/v1/reviews/:id                  | User     | Delete a review          |

### Users

| Method | Route                    | Access        | Description                     |
|--------|--------------------------|---------------|---------------------------------|
| POST   | /api/v1/users/signup     | Public        | Sign up a new user              |
| POST   | /api/v1/users/login      | Public        | Log in a user                   |
| GET    | /api/v1/users/logout     | Public        | Log out                         |
| PATCH  | /api/v1/users/updateMe   | Authenticated | Update current user info        |
| DELETE | /api/v1/users/deleteMe   | Authenticated | Deactivate current user         |

---

## 📦 Setup & Installation

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/tour-booking-api.git
cd tour-booking-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` using the structure above.

### 4. Run Development Server

```bash
npm run dev
```

---

## 🔒 Security Implemented

- **Helmet**: Secure HTTP headers
- **Rate Limiting**: Limit repeated requests from same IP
- **XSS-Clean**: Prevent cross-site scripting
- **Mongo Sanitize**: Prevent NoSQL injections
- **HPP**: Prevent HTTP parameter pollution
- **CORS**: Configurable cross-origin resource sharing

---

## 📌 Future Improvements

- Stripe payment integration
- Tour bookings feature
- Admin dashboard (React)
- Unit testing with Jest
- Deployment to Vercel + MongoDB Atlas

