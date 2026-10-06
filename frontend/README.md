# AuthenTick web app

React 19 + Vite + TypeScript. Plain CSS design system in `src/index.css`.

```bash
npm run dev -w frontend      # http://localhost:5173, proxies /api to localhost:4000
npm test -w frontend
npm run lint -w frontend
npm run build -w frontend
```

## Demo mode

If the API is unreachable, or the demo token is entered, the app runs against an in-browser mock (`src/lib/mockApi.ts`) with the same rules as the real API. Try it: open Verify, search `0xde70a11ce0000001`, and step the item from factory to shopper.

## Config

`frontend/.env.example` lists the optional variables: `VITE_API_PROXY_TARGET` (dev proxy) and `VITE_API_URL` (direct API base for production builds).
