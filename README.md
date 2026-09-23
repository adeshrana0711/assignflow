# AssignFlow — React Frontend + Express Backend

This repository is now split into two folders:

- `backend/` — existing Express/MongoDB backend code
- `frontend/` — new React frontend scaffold created with Vite

## Backend

### Run backend
1. Open terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start backend server:
   ```bash
   npm run dev
   ```

### Notes
- The backend currently still uses EJS views under `backend/views/`
- The backend files were moved into `backend/` without changing their code
- Keep your `.env` values in `backend/.env`

## Frontend

### Run frontend
1. Open terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start React dev server:
   ```bash
   npm run dev
   ```

### Build frontend
```bash
npm run build
```

## Next step
Convert the `backend/views/*.ejs` pages to React components in `frontend/src/`.

Then update the backend to serve JSON APIs and/or the React build.
