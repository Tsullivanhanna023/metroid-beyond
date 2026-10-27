import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'site');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
let checks = 0;
const check = (value, description) => { assert.ok(value, description); checks++; };

async function inventory(dir, prefix = '') {
  const found = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    check(!entry.isSymbolicLink(), `${relative}: no symbolic link`);
    if (entry.isDirectory()) found.push(...await inventory(path.join(dir, entry.name), relative + '/'));
    else { check(entry.isFile(), `${relative}: regular file`); found.push(relative); }
  }
  return found.sort();
}

const release = JSON.parse(await fs.readFile(path.join(root, 'release-sha256.json'), 'utf8'));
check(/^\d+\.\d+\.\d+$/.test(release.version), 'finished browser release version');
const basePaths = release.basePaths;
check(Array.isArray(basePaths) && basePaths.length > 0 && basePaths.every(p => p.startsWith('/') && p.endsWith('/')), 'configured Pages base paths');
const listed = await inventory(site);
assert.deepEqual(listed, Object.keys(release.files).sort()); checks++;
for (const file of listed) {
  check(!file.includes('..') && !path.isAbsolute(file), `${file}: contained manifest path`);
  const bytes = await fs.readFile(path.join(site, file));
  const expected = release.files[file];
  check(bytes.length === expected.bytes && sha(bytes) === expected.sha256, `${file}: exact release bytes`);
  check(bytes.length < 25 * 1024 * 1024, `${file}: ordinary GitHub upload size`);
}
check(listed.includes('.nojekyll'), 'no Jekyll transformation');

const manifest = JSON.parse(await fs.readFile(path.join(site, 'asset-manifest.json'), 'utf8'));
check(manifest.version === release.version, 'asset manifest release');
for (const [name, entry] of Object.entries(manifest.files)) {
  const aggregate = crypto.createHash('sha256'); let bytes = 0;
  for (const chunk of entry.chunks) {
    const data = await fs.readFile(path.join(site, chunk.file));
    check(data.length === chunk.bytes && sha(data) === chunk.sha256, `${chunk.file}: original chunk`);
    aggregate.update(data); bytes += data.length;
  }
  check(bytes === entry.bytes && aggregate.digest('hex') === entry.sha256, `${name}: original finished export reconstructed`);
}
for (const [name, entry] of Object.entries(manifest.copied)) {
  const bytes = await fs.readFile(path.join(site, name));
  check(bytes.length === entry.bytes && sha(bytes) === entry.sha256, `${name}: original engine/audio companion`);
}

const adapter = await fs.readFile(path.join(site, 'engine-stream.js'), 'utf8');
const shell = await fs.readFile(path.join(site, 'index.html'), 'utf8');
const adapterHash=sha(Buffer.from(adapter));
const adapterScript='src="engine-stream.js?v='+adapterHash+'"';
check(shell.includes(adapterScript) && shell.indexOf(adapterScript) < shell.indexOf('src="index.js"'), 'exact content-addressed stream adapter before engine');
check(!shell.includes('src="engine-stream.js"'), 'no stale unversioned stream adapter script');
check(manifest.adapterSha256===adapterHash, 'asset manifest identifies exact adapter bytes');
check(shell.includes('const GODOT_THREADS_ENABLED = false;'), 'single-thread browser export without custom server headers');

const origin = 'https://travis-test.github.io';
let peakConnections = 0;
for (const basePath of basePaths) {
  const base = new URL(basePath, origin);
  const calls = []; let active = 0; let maximum = 0; let fault;
  const fixtureFetch = async (input, init) => {
    const request = new Request(input, init); const url = new URL(request.url); calls.push(request);
    if (request.signal.aborted) throw request.signal.reason;
    if (!url.pathname.startsWith(basePath + 'engine-parts/')) return new Response('passthrough');
    if (url.pathname === fault) return new Response('missing chunk', { status: 503 });
    const bytes = await fs.readFile(path.join(site, url.pathname.slice(basePath.length)));
    active++; maximum = Math.max(active, maximum); let at = 0; let done = false; let controller;
    const finish = () => { if (!done) { done = true; active--; request.signal.removeEventListener('abort', aborted); } };
    const aborted = () => { if (!done) { finish(); controller.error(request.signal.reason); } };
    return new Response(new ReadableStream({
      start(value) { controller = value; request.signal.addEventListener('abort', aborted, { once: true }); },
      pull(value) {
        if (request.signal.aborted) { aborted(); return; }
        if (at === bytes.length) { finish(); value.close(); return; }
        const end = Math.min(bytes.length, at + 65536); value.enqueue(bytes.subarray(at, end)); at = end;
      },
      cancel() { finish(); }
    }));
  };
  const context = vm.createContext({ fetch: fixtureFetch, URL, Request, Response, ReadableStream, AbortController, DOMException,
    document: { baseURI: new URL('index.html', base).href }, location: { origin } });
  vm.runInContext(adapter, context);
  for (const [name, entry] of Object.entries(manifest.files)) {
    const response = await context.fetch(new URL(name + '?release=' + encodeURIComponent(release.version), base).href,
      { headers: { 'X-Release-Check': 'kept' }, cache: 'reload', credentials: 'same-origin' });
    check(response.status === 200 && response.headers.get('content-type') === entry.mime, `${basePath}${name}: streaming response`);
    check(sha(new Uint8Array(await response.arrayBuffer())) === entry.sha256, `${basePath}${name}: runtime bytes`);
    check(calls.slice(-entry.chunks.length).every(request => {
      const url = new URL(request.url);
      return url.pathname.startsWith(basePath + 'engine-parts/') && url.search === '?release=' + encodeURIComponent(release.version) &&
        request.headers.get('X-Release-Check') === 'kept' && request.cache === 'reload' && request.credentials === 'same-origin';
    }), `${basePath}${name}: repository path and request options preserved`);
  }
  // A clean game start supplies no engine/package query. Each chunk therefore
  // receives its own immutable byte hash, while explicit caller queries above
  // remain unchanged. This exercises the real normal-URL startup path.
  for (const [name, entry] of Object.entries(manifest.files)) {
    const began=calls.length;
    const response=await context.fetch(new URL(name,base).href,
      {headers:{'X-Clean-Start':'kept'},cache:'default',credentials:'same-origin'});
    check(response.status===200 && response.headers.get('content-type')===entry.mime, basePath+name+': clean-start streaming response');
    check(sha(new Uint8Array(await response.arrayBuffer()))===entry.sha256,basePath+name+': clean-start exact runtime bytes');
    const defaultCalls=calls.slice(began);
    check(defaultCalls.length===entry.chunks.length && defaultCalls.every((request,index)=>{
      const url=new URL(request.url);const item=entry.chunks[index];
      return url.pathname===new URL(item.file,base).pathname && url.search==='?v='+item.sha256 &&
        request.headers.get('X-Clean-Start')==='kept' && request.cache==='default' && request.credentials==='same-origin';
    }),basePath+name+': clean-start chunks use their own byte hashes and preserve request options');
  }
  const module = await WebAssembly.compileStreaming(await context.fetch(new URL('index.wasm', base).href));
  check(module instanceof WebAssembly.Module, `${basePath}: actual Godot engine streaming compile`);
  check(maximum === 1 && active === 0, `${basePath}: one chunk at a time`); peakConnections = Math.max(peakConnections, maximum);
  const unrelated = new URL('music/music-prism.wav', base).href;
  check(await (await context.fetch(unrelated)).text() === 'passthrough' && calls.at(-1).url === unrelated, `${basePath}: music path untouched`);
  const foreign = 'https://other.test' + basePath + 'index.pck';
  await context.fetch(foreign); check(calls.at(-1).url === foreign, `${basePath}: unrelated origin untouched`);
  await context.fetch(new URL('index.wasm', base).href, { method: 'HEAD' });
  check(calls.at(-1).method === 'HEAD', `${basePath}: HEAD passes through`);
  await context.fetch(new URL('index.wasm', base).href, { headers: { Range: 'bytes=0-7' } });
  check(calls.at(-1).headers.get('Range') === 'bytes=0-7', `${basePath}: range passes through`);
  fault = basePath + 'engine-parts/index.pck.part-000.bin';
  await assert.rejects(context.fetch(new URL('index.pck', base).href), /HTTP 503/); checks++;
  fault = basePath + 'engine-parts/index.pck.part-001.bin';
  await assert.rejects((await context.fetch(new URL('index.pck', base).href)).arrayBuffer(), /HTTP 503/); checks++;
  fault = undefined;
  const abort = new AbortController();
  const interrupted = (await context.fetch(new URL('index.pck', base).href, { signal: abort.signal })).body.getReader();
  await interrupted.read(); abort.abort(new DOMException('Interrupted download', 'AbortError'));
  await assert.rejects((async () => { while (!(await interrupted.read()).done) {} })(), error => error.name === 'AbortError'); checks++;
  const cancelled = (await context.fetch(new URL('index.pck', base).href)).body.getReader();
  await cancelled.read(); await cancelled.cancel(); check(active === 0, `${basePath}: cancelled download stops`);
}
console.log(JSON.stringify({ result: 'PASS', version: release.version, checks, verifiedFiles: listed.length,
  totalBytes: Object.values(release.files).reduce((sum, entry) => sum + entry.bytes, 0),
  testedBasePaths: basePaths, maxConcurrentChunkFetches: peakConnections,
  originalEngineAndGameBytes: true, originalRecordedAudioBytes: true, contentAddressedAdapter: true, contentAddressedDefaultChunks: true, explicitCallerQueriesPreserved: true }, null, 2));
