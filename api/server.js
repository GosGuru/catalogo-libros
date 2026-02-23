// json-server serverless handler for Vercel.
// All requests routed here via vercel.json rewrites.
const jsonServer = require('json-server');
const path = require('path');

const app = jsonServer.create();
const router = jsonServer.router(path.join(process.cwd(), 'db.json'));
const middlewares = jsonServer.defaults({ noCors: true });

// Strip the leading /api prefix so json-server sees /books, /categories, etc.
app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/api/, '') || '/';
  next();
});

app.use(middlewares);
app.use(router);

module.exports = app;
