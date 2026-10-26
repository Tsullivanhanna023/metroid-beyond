/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":121093316,"sha256":"37da65f089d5031fc950b35ea1729e6ea392f327395f6c0cf88c597580d8795d","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"412cb93760ee7a0691668b60a9de743fde4261bb6cb049225447653967bad6ca"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"081f3c49bd226d421303916dbd22478af6239327cb278581d5d534824f09c143"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"7b7c6c1427139c8010b1619355eec5c62a56d9da55a8bafef51904113d8c75d3"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"1bc34b6e1502a67a7101d9421a6ee7d0bc4e759a1cb0ff939d617b2e196a5e8e"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"fe9242ba23d9eff51a8130571bcba6907f9c5eace911d442fee71ada5f0fe64a"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"475e807673c660f89b7db10c73dbc20ceffcf0a90e5ab050aea4e6702224b372"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"17009cb9bba3005dd3ffe361c2849beeff6f6b971ce531b39ce526efed71c1f1"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"6c8a5710c33afbfc90d5852969e07e91fe4c299150898b56b2cbb33cce3d0826"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"d5b72f68ef48185e21bf86d78b8cc0d4661dad1dd6a120cb1658caf0baaeb9d1"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"038e23b57e6d6561e465b70fd71414c8f7f989a68c510fcb226c389fb866d715"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"2b9064cadcd4ed4b74fff41006bda3b4408339482027a29d172a32b9929f5d66"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"22fae8b7b3f106cfe5b3e97d63b683b004c0573c6d781b5b4525089d2aacb36c"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"52d13278b3244aa269e713aa9adf17d087afd23ec91de4b0c17c9d718df693dd"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"be2573761d17cc8d2eb99fb19455a3e3447cfc9e1f3ab503ebd0b935f093d50e"},{"file":"engine-parts/index.pck.part-014.bin","bytes":3652804,"sha256":"7de043cefbb6eedd1413a22ce0e283595dec57f32d754493f99758b5936586a6"}]}};
  const nativeFetch = globalThis.fetch.bind(globalThis);
  const root = new URL('.', document.baseURI);
  const targets = new Map(Object.entries(files).map(([name, entry]) => [new URL(name, root).href, entry]));

  globalThis.fetch = async (input, init) => {
    let address;
    try { address = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, document.baseURI); }
    catch { return nativeFetch(input, init); }
    const exact = new URL(address);
    exact.search = '';
    exact.hash = '';
    const entry = address.origin === location.origin ? targets.get(exact.href) : undefined;
    if (!entry) return nativeFetch(input, init);
    const request = new Request(input, init);
    if (request.method !== 'GET' || request.headers.has('range') || request.integrity) return nativeFetch(input, init);
    const abort = new AbortController();
    const onAbort = () => abort.abort(request.signal.reason);
    if (request.signal.aborted) onAbort();
    else request.signal.addEventListener('abort', onAbort, { once: true });
    const cleanup = () => request.signal.removeEventListener('abort', onAbort);
    let reader;
    let part = 0;
    let partBytes = 0;
    let received = 0;
    async function openPart() {
      const item = entry.chunks[part];
      const chunkAddress = new URL(item.file, root);
      chunkAddress.search = address.search;
      const response = await nativeFetch(new Request(chunkAddress, request), { signal: abort.signal });
      if (!response.ok) throw new Error(`Unable to load ${item.file}: HTTP ${response.status}`);
      if (!response.body) throw new Error(`Empty response for ${item.file}`);
      reader = response.body.getReader();
      partBytes = 0;
    }
    try { await openPart(); }
    catch (error) { cleanup(); abort.abort(error); throw error; }
    const body = new ReadableStream({
      async pull(controller) {
        try {
          while (part < entry.chunks.length) {
            const result = await reader.read();
            if (!result.done) {
              partBytes += result.value.byteLength;
              received += result.value.byteLength;
              if (partBytes > entry.chunks[part].bytes) throw new Error('Hosting part exceeds its declared size.');
              controller.enqueue(result.value);
              return;
            }
            reader.releaseLock();
            reader = undefined;
            if (partBytes !== entry.chunks[part].bytes) throw new Error('Hosting part is incomplete.');
            part++;
            if (part < entry.chunks.length) await openPart();
          }
          if (received !== entry.bytes) throw new Error('Game download is incomplete.');
          cleanup();
          controller.close();
        } catch (error) {
          cleanup();
          abort.abort(error);
          if (reader) await reader.cancel(error).catch(() => {});
          controller.error(error);
        }
      },
      async cancel(reason) {
        cleanup();
        abort.abort(reason);
        if (reader) await reader.cancel(reason).catch(() => {});
      }
    });
    return new Response(body, { status: 200, headers: { 'Content-Type': entry.mime, 'Content-Length': String(entry.bytes), 'Cache-Control': 'no-cache' } });
  };
})();
