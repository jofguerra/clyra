import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createConnector } from './server.mjs';
import { reportUrl } from './raly.mjs';

async function setup(t, overrides={}) {
  let closed = 0, connects = 0;
  const server = createConnector({ token:'synthetic-pairing-key', origins:['http://localhost:8090'], adapterFactory:async () => ({
    connect:async () => { connects++; return [{id:'abcd-1234',label:'Synthetic study'}]; },
    list:async () => [{id:'abcd-1234',label:'Synthetic study'}],
    download:async id => { if(id !== 'abcd-1234') throw new Error('unknown-study'); return Buffer.from('%PDF-synthetic'); },
    close:async () => { closed++; },
  }), ...overrides });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const call = (path, method='GET', body, headers={}) => fetch(base+path,{method,headers:{Origin:'http://localhost:8090','X-Clyra-Token':'synthetic-pairing-key','Content-Type':'application/json',...headers},body:body ? JSON.stringify(body):undefined});
  const login = async () => (await call('/connect','POST',{username:'test',password:'synthetic'})).json();
  return {call,login,counts:()=>({closed,connects})};
}
test('rejects unpaired requests, foreign origins and invalid credentials without creating a session',async t => {
  const s = await setup(t);
  assert.equal((await s.call('/connect','POST',{}, {'X-Clyra-Token':'bad'})).status,401);
  assert.equal((await s.call('/connect','POST',{}, {Origin:'https://foreign.invalid'})).status,403);
  assert.equal((await s.call('/connect','POST',{username:'',password:''})).status,400);
  assert.equal(s.counts().connects,0);
});
test('session gates listing and download; disconnect invalidates it',async t => {
  const s = await setup(t); const {session,studies} = await s.login();
  assert.equal(studies.length,1); assert.ok(!JSON.stringify(studies).includes('skey'));
  assert.equal((await s.call('/studies')).status,401);
  const headers = {'X-Raly-Session':session};
  assert.equal((await s.call('/studies','GET',undefined,headers)).status,200);
  const pdf = await s.call('/studies/abcd-1234/pdf','POST',undefined,headers);
  assert.equal(pdf.headers.get('content-type'),'application/pdf'); assert.equal(await pdf.text(),'%PDF-synthetic');
  assert.equal((await s.call('/session','DELETE',undefined,headers)).status,200);
  assert.equal(s.counts().closed,1);
  assert.equal((await s.call('/studies','GET',undefined,headers)).status,401);
});
test('expired sessions close browser and fail rather than reuse credentials',async t => {
  const s = await setup(t,{ttl:-1}); const {session} = await s.login();
  assert.equal((await s.call('/studies','GET',undefined,{'X-Raly-Session':session})).status,401);
  assert.equal(s.counts().closed,1);
});
test('connector hides upstream exceptions and closes the failed session',async t => {
  let closed = false;
  const s = await setup(t,{adapterFactory:async()=>({connect:async()=>{throw new Error('secret upstream URL');},close:async()=>{closed=true;}})});
  const response = await s.call('/connect','POST',{username:'test',password:'synthetic'});
  assert.equal(response.status,502); assert.deepEqual(await response.json(),{error:'connection-failed'}); assert.equal(closed,true);
});
test('report URLs stay on the exact Raly PDF route',()=>{
  assert.ok(reportUrl('./pacientesresultados?fnt=resultadopdf&cadena=synthetic').startsWith('https://laboratorioraly.com/'));
  for(const url of ['https://foreign.invalid/a','//foreign.invalid/a','https://laboratorioraly.com/admin','https://user@laboratorioraly.com/labeemapp/pacientesresultados?fnt=resultadopdf']) assert.throws(()=>reportUrl(url));
});
