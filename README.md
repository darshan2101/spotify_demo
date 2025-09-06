# Spotify Demo – Backend API

A backend demo project built with **Node.js, Express, and MongoDB** that provides basic Spotify-like functionality:

- User authentication & authorization (JWT-based)
- Album and song management with soft deletes
- Following albums and receiving notifications
- Analytics (top albums, genre stats, artist timelines)
- Caching with NodeCache
- API documentation via Swagger

---

## Prerequisites

- [Node.js](https://nodejs.org/) (>= 16)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [npm](https://www.npmjs.com/)

---

## Installation

```bash
git clone https://github.com/yourusername/spotify-demo.git
cd spotify-demo
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/spotify_demo

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Running the Server

```bash
npm start
```

Server runs at:

```
http://localhost:4000
```

---

## API Documentation

Swagger UI is at:

```
http://localhost:4000/docs
```

The documentation is built from JSON files under `src/swagger/`.

---

## Health Check

```
GET /health
```

Returns uptime and status.

---

## Project Structure

```
src/
  app.js              # Express app setup
  index.js            # Entry point
  config/             # DB & swagger configs
  controllers/        # Controllers for each feature
  middlewares/        # Auth, validation, error handling
  models/             # Mongoose models
  routes/             # Express routes
  swagger/            # Swagger JSON docs
  utils/              # JWT, asyncHandler, etc.
```

---

## Features

- **Auth**: Register, login, refresh token, profile.
- **Albums**: CRUD with soft deletes, songs inside albums.
- **Follow**: Follow/unfollow albums.
- **Notifications**: Notify followers when songs are added.
- **Analytics**: Top albums, genre breakdown, artist timeline.
- **Cache**: GET responses cached for performance.

---

## Testing

You can use:
- Postman collection (already prepared)  
- Or run `curl` commands from the docs.

---

## License

MIT License