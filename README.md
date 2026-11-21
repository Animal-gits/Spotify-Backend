# Pavi

Pavi is a React music discovery app and artist studio backed by the existing Express and MongoDB API.

## Run locally

1. Configure `BE/.env` with `MONGO_URI`, `JWT_SECRET`, and `IMAGEKIT_PRIVATE_KEY`.
2. Start the API:

   ```powershell
   cd BE
   npm install
   npm run dev
   ```

   The backend listens on `http://localhost:3000`.

3. Start the frontend in another terminal:

   ```powershell
   cd FE
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. The frontend defaults to `http://localhost:3000/api`; set `VITE_API_URL` in `FE/.env.local` to override it.

For a deployed frontend, set `FRONTEND_URL` in the backend environment to its exact origin (or a comma-separated list of origins). The API uses credentialed requests so the authentication cookie can be sent between the frontend and backend.

## Accounts and features

Registration lets a new account choose Listener or Artist. Listeners can discover and search tracks, browse collections, play audio, and update their profile. Artists have a separate studio for uploading audio, editing or deleting their own tracks, creating collections, and managing their profile.

The backend stores uploaded audio in ImageKit. Artist upload, edit, and delete endpoints require an artist session; track and collection reads require an authenticated session.
