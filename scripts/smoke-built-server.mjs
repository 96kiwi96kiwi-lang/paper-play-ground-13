import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import assert from 'node:assert/strict';
const socket = createServer();
socket.listen(0, '127.0.0.1');
await once(socket, 'listening');
const port = socket.address().port;
await new Promise(resolve => socket.close(resolve));
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port),
    KUCOIN_API_KEY: '', KUCOIN_SECRET: '', KUCOIN_PASSWORD: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
child.stdout.on('data', chunk => output += chunk);
child.stderr.on('data', chunk => output += chunk);
try {
  let response;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (child.exitCode !== null) throw new Error('Server exited before readiness');
    try {
      response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(3000) });
      break;
    } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.ok(response, 'Server must become reachable');
  assert.equal(response.status, 200, 'Home page must render successfully');
  assert.match(await response.text(), /Algo Paper Trader/);
  console.log('PASS: production server renders home with no exchange credentials');
} catch (error) {
  console.error(output);
  throw error;
} finally {
  child.kill('SIGTERM');
  const force = setTimeout(() => child.kill('SIGKILL'), 6000);
  force.unref();
  if (child.exitCode === null) await once(child, 'exit');
  clearTimeout(force);
}
