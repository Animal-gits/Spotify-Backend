# Pavi

Pavi is a full-stack music discovery platform and artist studio. Listeners can discover and search music, browse collections, play tracks, and manage their profiles. Artists can upload audio, edit or delete their own tracks, create collections, and manage their profile.

The application consists of a React frontend and an Express/MongoDB backend. Uploaded audio is stored in ImageKit, while track metadata and relationships are stored in MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Authentication and Authorization](#authentication-and-authorization)
- [CRUD Operations](#crud-operations)
- [File Upload Process](#file-upload-process)
- [Database Models](#database-models)
- [API Reference](#api-reference)
- [Frontend Concepts](#frontend-concepts)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [CORS and Sessions](#cors-and-sessions)
- [Available Scripts](#available-scripts)
- [Security and Validation](#security-and-validation)
- [Known Limitations](#known-limitations)

## Features

### Listener features

- Register and log in
- Discover music
- Search by track title or artist name
- Browse all collections
- View individual collections
- Play, pause, seek, and change volume
- Move to the previous or next track
- View track details
- Update username and email
- Log out

### Artist features

- Access a dedicated artist studio
- Upload audio up to 100 MB
- Validate files as audio before upload
- View the artist's uploaded tracks
- Edit track titles
- Delete tracks and remove their ImageKit files
- Automatically remove deleted tracks from collections
- Create collections from owned tracks
- View the artist's collections
- Update profile information

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| React DOM 19 | Rendering React components |
| React Router DOM 7 | Page routing and protected routes |
| Vite 6 | Development server and production bundler |
| JavaScript ES Modules | Frontend module system |
| Lucide React | Navigation and interface icons |
| CSS3 | Styling, layout, responsiveness, and themes |
| Browser Fetch API | Communication with the REST API |
| HTML5 `<audio>` | Audio playback |
| FormData | Multipart audio uploads |
| Google Fonts | DM Sans and Manrope fonts |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript server runtime |
| Express 5 | HTTP server, routing, and middleware |
| MongoDB | Document database |
| Mongoose 9 | MongoDB schemas, models, queries, and population |
| JSON Web Token | Stateless authentication tokens |
| bcryptjs | Password hashing and verification |
| cookie-parser | Reading authentication cookies |
| Multer | Multipart upload and file validation |
| dotenv | Environment variable loading |
| `@imagekit/nodejs` | ImageKit upload and deletion |
| Nodemon | Restarting the backend during development |

## Project Structure

```text
Spotify/
├── BE/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── music.controller.js
│       ├── db/
│       │   └── db.js
│       ├── middlewares/
│       │   └── auth.middleware.js
│       ├── models/
│       │   ├── album.model.js
│       │   ├── music.model.js
│       │   └── user.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── music.routes.js
│       └── services/
│           └── storage.service.js
├── FE/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── api/
│       │   └── client.js
│       ├── auth/
│       │   └── AuthContext.jsx
│       ├── components/
│       ├── pages/
│       └── player/
│           └── PlayerContext.jsx
└── README.md
```

## Architecture

The backend uses an MVC-style organization:

- **Routes** map HTTP paths and methods to middleware and controllers.
- **Middleware** validates JWT cookies and roles.
- **Controllers** validate request data and implement application logic.
- **Models** define MongoDB schemas and relationships.
- **Services** isolate ImageKit operations.
- **Database module** establishes the Mongoose connection.

The frontend uses:

- `App.jsx` for route composition
- `AuthContext.jsx` for session state
- `PlayerContext.jsx` for persistent playback state
- `api/client.js` for REST API communication
- Context providers for shared state
- Protected route components for authentication and role checks

## Authentication and Authorization

### Registration

1. The frontend sends username, email, password, and role.
2. The backend validates required fields.
3. Only `user` and `artist` roles are accepted.
4. MongoDB is checked for duplicate usernames or emails.
5. bcrypt hashes the password with 10 salt rounds.
6. A new user document is created.
7. A JWT is created from the user ID and role.
8. The JWT is stored in an HTTP-only cookie.
9. Public user information is returned to the frontend.

### Login

1. The user submits a username or email and password.
2. The backend searches for either identifier.
3. bcrypt compares the submitted password with the stored hash.
4. A JWT is created after successful verification.
5. The JWT is placed in the cookie.
6. The frontend updates `AuthContext` with the returned user.

### Session restoration

On a page reload:

1. `AuthContext` calls `GET /api/auth/me`.
2. The backend reads the JWT cookie.
3. The JWT signature and expiration are verified.
4. The user is loaded from MongoDB.
5. The password field is excluded.
6. Authentication state is restored in React.

### Logout

The logout endpoint clears the token cookie. The frontend also removes the user from React state.

### JWT cookie settings

| Setting | Behavior |
|---|---|
| HTTP-only | Prevents browser JavaScript from directly reading the cookie |
| Secure | Enabled in production |
| SameSite | `strict` in development and `none` in production |
| Maximum age | Seven days |
| JWT expiration | Seven days |

### Small-scale role-based access

| Role | Access |
|---|---|
| `user` | Listener pages, track and album reads, profile updates |
| `artist` | Artist studio, owned-track management, collection creation |

Backend middleware supports:

- `authUser` - only accepts listeners
- `authArtist` - only accepts artists
- `authAny` - accepts listeners or artists

Protected routes return:

- `401 Unauthorized` for missing or invalid authentication
- `403 Forbidden` for insufficient roles
- Ownership errors when an artist tries to modify another artist's track

Frontend route guards redirect unauthorized users and separate listener and artist pages.

## CRUD Operations

### User

- **Create:** Register an account.
- **Read:** Get the current user.
- **Update:** Change username or email.
- **Delete:** No account deletion endpoint is implemented.

### Music

- **Create:** Upload a track as an artist.
- **Read:** List tracks, search tracks, view track details, or list artist tracks.
- **Update:** Change an owned track title.
- **Delete:** Delete an owned track and its ImageKit file.

### Album

- **Create:** Create a collection using owned tracks.
- **Read:** List collections or view a collection.
- **Update:** No dedicated album update endpoint is implemented.
- **Delete:** No album deletion endpoint is implemented.

Deletion of a track removes its `_id` from every album that contains it.

## File Upload Process

### 1. Frontend selection

In the Artist Dashboard:

1. The artist enters a track title.
2. The browser file input accepts `audio/*`.
3. The selected file is stored in React state.
4. A `FormData` object is created.
5. `title` and `music` are appended to it.

### 2. Frontend API request

The API client sends:

```text
POST /api/music/upload
credentials: include
```

No manual `Content-Type` header is added for `FormData`. The browser automatically sets the multipart content type and boundary.

### 3. Authentication

The upload route first runs `authArtist`, ensuring the JWT belongs to an artist account.

### 4. Multer processing

Multer:

- Uses memory storage
- Stores the temporary file in `req.file.buffer`
- Limits file size to 100 MB
- Checks that the MIME type starts with `audio/`
- Reads the multipart field named `music`

Possible upload errors:

- `400` for missing audio or an invalid MIME type
- `413` for files larger than 100 MB

### 5. Controller processing

The music controller:

1. Trims and validates the track title.
2. Ensures a file was received.
3. Converts the file buffer to Base64.
4. Sends the Base64 file to the ImageKit storage service.

### 6. ImageKit storage

The storage service uses `@imagekit/nodejs` to upload the file:

- Folder: `complete-backend-spotify-project/music`
- Filename: `music_<timestamp>`
- Authentication: `IMAGEKIT_PRIVATE_KEY`

ImageKit returns:

- `url` - public audio URL
- `fileId` - ImageKit identifier used later for deletion

### 7. MongoDB record

MongoDB stores:

```text
uri       -> ImageKit public URL
fileId    -> ImageKit file ID
title     -> track title
artist    -> artist ObjectId
```

### 8. Audio playback

React stores the returned track and sets the audio element's `src` to the ImageKit URL. The Player Context manages playback, progress, queue, volume, and errors.

### 9. Track deletion

When an artist deletes a track:

1. The track ID is validated.
2. Ownership is checked against the JWT user ID.
3. ImageKit deletes the file using `fileId`.
4. Album documents remove the track reference using `$pull`.
5. Mongoose deletes the track document.

## Database Models

The database name is `apna_music`.

### User

```text
username  String, required, unique
email     String, required, unique
password  String, required
role      String, enum: user/artist, default: user
```

The password field is never returned by profile/session endpoints.

### Music

```text
uri       String, required
fileId    String
title     String, required
artist    ObjectId -> user, required
```

### Album

```text
title   String, required
musics  ObjectId[] -> music
artist  ObjectId -> user, required
```

Mongoose population is used to include usernames and track data in API responses.

## API Reference

### Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create an account |
| `POST` | `/api/auth/login` | Public | Log in |
| `POST` | `/api/auth/logout` | Public | Clear the auth cookie |
| `GET` | `/api/auth/me` | Any authenticated role | Get current user |
| `PATCH` | `/api/auth/me` | Any authenticated role | Update username or email |

### Music

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/music/upload` | Artist | Upload audio |
| `POST` | `/api/music/album` | Artist | Create a collection |
| `GET` | `/api/music/artist/musics` | Artist | List owned tracks |
| `GET` | `/api/music/artist/albums` | Artist | List owned collections |
| `GET` | `/api/music/albums` | Any authenticated role | List collections |
| `GET` | `/api/music/albums/:albumId` | Any authenticated role | Get a collection |
| `GET` | `/api/music` | Any authenticated role | Search and list tracks |
| `GET` | `/api/music/:musicId` | Any authenticated role | Get one track |
| `PATCH` | `/api/music/:musicId` | Artist | Edit an owned track |
| `DELETE` | `/api/music/:musicId` | Artist | Delete an owned track |

### Search and pagination

`GET /api/music` supports:

| Parameter | Default | Limit |
|---|---:|---:|
| `q` | Empty | Searches titles and artist usernames |
| `page` | `1` | Minimum `1` |
| `limit` | `50` | `1-100` |

Example:

```text
GET /api/music?q=night&page=1&limit=20
```

Search is case-insensitive, and regular-expression characters in search input are escaped.

## Frontend Concepts

The frontend uses:

- Controlled form inputs
- React Context API
- Custom `useAuth` and `usePlayer` hooks
- `useState`
- `useEffect`
- `useCallback`
- `useMemo`
- `useRef`
- React Router nested routes
- Protected routes
- Role routes
- Debounced music search
- Loading, error, empty, and success states
- Parallel API calls with `Promise.all`
- Active-request guards to prevent stale state updates
- Inline track editing
- Browser confirmation dialogs
- HTML5 audio events
- Track queue management
- Audio seeking
- Volume controls
- Previous and next track navigation
- Responsive navigation and layouts
- `lucide-react` icons
- Custom range-slider styling

## Environment Variables

### Backend

Create `BE/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

`FRONTEND_URL` may contain multiple exact origins separated by commas.

### Frontend

Create `FE/.env.local` if needed:

```env
VITE_API_URL=http://localhost:3000/api
```

The frontend defaults to `http://localhost:3000/api`.

## Local Development

### Prerequisites

- Node.js and npm
- MongoDB or MongoDB Atlas
- An ImageKit account and private key

### 1. Configure the backend

```powershell
cd BE
New-Item -ItemType File -Name .env
```

Add the required values to `.env`.

### 2. Install dependencies and start the API

```powershell
cd BE
npm install
npm run dev
```

The backend listens at:

```text
http://localhost:3000
```

### 3. Install dependencies and start the frontend

Open another terminal:

```powershell
cd FE
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## CORS and Sessions

The backend:

- Allows `http://localhost:5173` in development
- Accepts exact origins from `FRONTEND_URL`
- Adds `Access-Control-Allow-Credentials: true`
- Handles `OPTIONS` preflight requests
- Allows `GET`, `POST`, `PATCH`, and `DELETE`
- Uses credentialed Fetch requests so the authentication cookie is sent

For deployed frontend and backend hosts, configure both origins and cookie security settings correctly.

## Available Scripts

### Backend

```powershell
npm run dev
npm start
```

- `npm run dev` runs `nodemon server.js`
- `npm start` runs `node server.js`

### Frontend

```powershell
npm run dev
npm run build
npm run preview
```

- `npm run dev` starts Vite
- `npm run build` creates a production build
- `npm run preview` previews the production build

## Security and Validation

The project includes:

- bcrypt password hashing
- HTTP-only JWT cookies
- JWT verification
- Server-side role checks
- Track ownership checks
- MongoDB ObjectId validation
- Regular-expression search escaping
- Duplicate username and email checks
- 100 MB upload limit
- Audio MIME-type validation
- Password fields excluded from profile responses
- CORS origin validation
- Production secure-cookie settings

## Known Limitations

- This is small-scale role control, not a complete permission system.
- Album update and delete operations are not implemented.
- Account deletion is not implemented.
- The backend test script is currently a placeholder.
- No frontend test suite is configured.
- Track title validation is limited to non-empty values.
- Uploaded audio is stored externally by ImageKit.
