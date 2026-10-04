import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { once } from 'node:events';
import assert from 'node:assert/strict';

const dir = await mkdtemp(join(tmpdir(), 'paper-worker-startup-'));
const preload = join(dir, 'quotes.mjs');
await writeFile(preload, `globalThis.fetch = async (url) => {
 if (!String(url).startsWith('https://api.coingecko.com/api/v3/simple/price?')) throw new Error('Unexpected outbound request');
 return new Response(JSON.stringify(Object.fromEntries(['bitcoin','ethereum','solana','binancecoin'].map(id => [id,{usd:100,last_updated_at:Math.floor(Date.now()/1000)}]))),{status:200});
};`);
const child = spawn(process.execPath, ['--import', preload, resolve('.output/server/index.mjs')], {
 cwd: dir,
 env: {...process.env, HOST:'127.0.0.1', PORT:'0', PAPER_SERVER_LOOP:'1', WORKER_LEASE_PATH:join(dir,'data','worker-lease.json'), KUCOIN_API_KEY:'', KUCOIN_SECRET:'', KUCOIN_PASSWORD:''},
 stdio: ['ignore','pipe','pipe'],
});
let output = '';
child.stdout.on('data', chunk => output += chunk);
child.stderr.on('data', chunk => output += chunk);
try {
 // Deliberately make no inbound HTTP request: SSR is lazy-loaded by Nitro.
 for(let i=0;i<100 && !output.includes('[paper-loop] tick symbol=BNB/USDT');i++) {
  if(child.exitCode!==null) throw new Error(output);
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 assert.match(output,/\[paper-loop\] starting market loop/);
 assert.match(output,/\[paper-loop\] tick symbol=BNB\/USDT.*action=hold/);
 const state=JSON.parse(await readFile(join(dir,'data','bot-state.json'),'utf8'));
 assert.ok(state.marketHistory['BTC/USDT'].length>0);
 assert.equal(state.mode,'paper');
 console.log('PASS: worker starts, evaluates quotes and persists history without any browser request');
} finally {
 child.kill('SIGTERM');
 const force=setTimeout(()=>child.kill('SIGKILL'),6000);
 force.unref();
 if(child.exitCode===null) await once(child,'exit');
 clearTimeout(force);
 await rm(dir,{recursive:true,force:true});
}
