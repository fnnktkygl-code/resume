import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const vercelApiMock = () => {
  return {
    name: 'vercel-api-mock',
    configureServer(server) {
      const env = loadEnv('', process.cwd(), '');
      Object.assign(process.env, env);
      
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            if (body) {
              try { req.body = JSON.parse(body); } catch(e) {}
            }
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            const urlStr = req.originalUrl.replace('/api', '');
            const pathname = urlStr.split('?')[0];
            const apiFile = path.resolve(`./api${pathname}.js`);
            if (fs.existsSync(apiFile)) {
              try {
                const module = await import('file://' + apiFile + '?t=' + Date.now());
                await module.default(req, res);
              } catch(e) {
                console.error(e);
                res.status(500).json({ error: e.message });
              }
            } else {
              next();
            }
          });
        } catch(e) {
          next(e);
        }
      });
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), vercelApiMock()],
  server: {
    port: 5173,
    open: true,
  },
})
