# Airbnb Capstone

A full-stack accommodation booking application built for my Zaio capstone.

## Live website

https://airbnbcapstone.onrender.com

## Technologies

- React and Vite
- React Router
- Node.js and Express
- MongoDB Atlas and Mongoose
- JWT authentication and bcrypt
- Multer and Sharp for image uploads
- Render for deployment

## Features

- Search properties by location and guest capacity
- View property details, photos and amenities
- Calculate reservation costs from selected dates
- Create reservations with date and guest validation
- Register, log in and log out
- Admin dashboard for managing properties and reservations
- Upload property images
- Responsive layouts

This is an educational demonstration. No payments are processed.

## Run locally

Requires Node.js 24, npm and a MongoDB Atlas database.

From the project root, install dependencies:

```bash
npm ci --prefix server
npm ci --prefix client
```

Create `server/.env` with your own values:

```dotenv
MONGO_URI=mongodb+srv://YOUR_USERNAME:<db_password>@YOUR_CLUSTER.mongodb.net/
MONGO_PASSWORD=YOUR_DATABASE_PASSWORD
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
CLIENT_URL=http://localhost:5173
PORT=5000
```

Keep `<db_password>` in the URI: the server replaces it with the encoded password.

Allow your development machine's IP address in MongoDB Atlas. Never commit `.env` or real credentials.

Start the backend:

```bash
npm start
```

In a second terminal, start the frontend:

```bash
npm run dev --prefix client
```

Open http://localhost:5173.

To import the sample properties:

```bash
npm run seed --prefix server
```

## Production build

```bash
npm run build --prefix client
npm start
```

Express serves the built frontend from `client/dist`.

## Main API routes

- `GET /api/health` — server and database status
- `GET /api/properties` — property listings
- `GET /api/properties/:id` — property details
- `POST /api/auth/register` — registration
- `POST /api/auth/login` — login
- `POST /api/reservations` — create a reservation
- `/api/admin/properties` — protected property management
- `/api/admin/reservations` — protected reservation management
- `POST /api/images` — protected admin image upload
- `GET /api/images/:id` — retrieve an uploaded image

Admin endpoints require a valid bearer token and an administrator account. Registration creates a regular user account.

## Verification

Manual checks covered search, property photos, login, reservation creation and viewing reservations in the deployed admin dashboard.

The frontend production build was also checked. Automated tests have not yet been added.

## Limitations

- Pricing includes sample fees and tax calculations.
- No payment gateway is connected.
- Search filters location and capacity; reservation creation checks date conflicts.
- Render's free service may take longer to respond after inactivity.
