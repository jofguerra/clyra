import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { writeFileSync, chmodSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createRalyAdapter } from './raly.mjs';

export function createConnector({ token, origins, adapterFactory = createRalyAdapter, ttl = 15 * 60 * 1000 }) {
  let adapter = null, session = '', expires = 0, busy = false;
  const equal = value => typeof value === 'string' && Buffer.byteLength(value) === Buffer.byteLength(token) && timingSafeEqual(Buffer.from(value),Buffer.from(token));
  const disconnect = async () => { const old = adapter; adapter = null; session = ''; expires = 0; await old?.close(); };
  const server = createServer(async (req,res) => {
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    const json = (status, data) => { res.writeHead(status, {'Content-Type':'application/json'}); res.end(JSON.stringify(data)); };
    if (!['127.0.0.1','localhost'].some(host => req.headers.host === `${host}:${server.address().port}`) || !origins.includes(req.headers.origin)) return json(403,{error:'origin-denied'});
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Vary','Origin');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods','GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Clyra-Token, X-Raly-Session');
      res.writeHead(204); return res.end();
    }
    if (!equal(req.headers['x-clyra-token'])) return json(401,{error:'pairing-required'});
    if (busy) return json(409,{error:'busy'});
    busy = true;
    try {
      if (adapter && Date.now() >= expires) await disconnect();
      if (req.method === 'POST' && req.url === '/connect') {
        let body = '';
        for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 8192) { json(413,{error:'too-large'}); return; } }
        let input;
        try { input = JSON.parse(body); } catch { return json(400,{error:'invalid-input'}); }
        if (typeof input.username !== 'string' || typeof input.password !== 'string' || !input.username.trim() || !input.password || input.username.length > 200 || input.password.length > 500) return json(400,{error:'invalid-input'});
        await disconnect();
        adapter = await adapterFactory();
        const studies = await adapter.connect(input.username, input.password);
        session = randomBytes(32).toString('hex'); expires = Date.now() + ttl;
        return json(200,{session,studies});
      }
      if (!adapter || !session || req.headers['x-raly-session'] !== session) return json(401,{error:'session-expired'});
      if (req.method === 'DELETE' && req.url === '/session') { await disconnect(); return json(200,{ok:true}); }
      if (req.method === 'GET' && req.url === '/studies') return json(200,{studies:await adapter.list()});
      if (req.method === 'POST' && /^\/studies\/[a-f0-9-]+\/pdf$/.test(req.url)) {
        const bytes = await adapter.download(req.url.split('/')[2]);
        res.writeHead(200,{'Content-Type':'application/pdf','Content-Length':bytes.length}); return res.end(bytes);
      }
      return json(404,{error:'not-found'});
    } catch (error) {
      const known = ['login-failed','portal-changed','session-expired','unknown-study','invalid-report','pdf-too-large','invalid-pdf'];
      const code = known.includes(error.message) ? error.message : 'connection-failed';
      await disconnect().catch(() => {});
      if (!res.headersSent) json(502,{error:code});
    } finally { busy = false; }
  });
  const timer = setInterval(() => { if (!busy && adapter && Date.now() >= expires) { busy = true; disconnect().catch(() => {}).finally(() => { busy = false; }); } },1000);
  timer.unref();
  server.on('close', () => { clearInterval(timer); void disconnect(); });
  server.requestTimeout = 30000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const token = randomBytes(32).toString('hex');
  writeFileSync('.raly-connector-token',token,{mode:0o600});
  chmodSync('.raly-connector-token',0o600);
  const origins = (process.env.CLYRA_APP_ORIGINS || 'http://localhost:8090,http://127.0.0.1:8090').split(',');
  const server = createConnector({token,origins});
  server.listen(8098,'127.0.0.1', () => console.log('Conector local en 127.0.0.1:8098. Abre .raly-connector-token para emparejar Clyra. Sesiones de 15 minutos; sin persistencia.'));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
