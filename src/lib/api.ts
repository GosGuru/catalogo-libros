/** Base URL for the REST API.
 *  - Development:  http://localhost:3001  (json-server)
 *  - Production:   /api                   (Vercel serverless)
 */
export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
