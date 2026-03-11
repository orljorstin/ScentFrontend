# Scentsmiths (ScentFrontend)

TypeScript + React + Vite frontend for **Scentsmiths**, a perfume e-commerce experience.

The app integrates with the **Fragella API** to fetch detailed fragrance note breakdowns for each fragrance (“frag”).

## Tech Stack
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS

## Getting Started (Local)

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install
```bash
npm install
```

### Run the dev server
```bash
npm run dev
```

Vite will print the local URL in your terminal (commonly `http://localhost:5173`).

## Build & Preview

### Build
```bash
npm run build
```

### Preview the production build
```bash
npm run preview
```

## Environment Variables

See `.env.example`.

- `VITE_API_URL` — Base URL for the backend API (typically the Render deployment URL).  
  - **Local development:** can be left blank because the Vite dev proxy handles API calls.
  - **Production (Vercel):** must be set.

Example:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## Deployment

A full walkthrough is available in `DEPLOYMENT.md` (Supabase + Render + Vercel).

## Scripts
- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally

## Contributing
1. Create a branch
2. Commit your changes
3. Open a PR

## License
Add a license file or mark this project as proprietary.
