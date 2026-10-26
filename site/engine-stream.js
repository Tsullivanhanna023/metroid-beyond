/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":118706620,"sha256":"907af164c14cc17f62bdd99b663e93d9ef0ead0d138b8219f518d585d47ed316","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"4c5a561fcf31b0879349cfd55680253d4dc14ab4a34ffe68c86b13c0bf75f89d"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"081f3c49bd226d421303916dbd22478af6239327cb278581d5d534824f09c143"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"7b7c6c1427139c8010b1619355eec5c62a56d9da55a8bafef51904113d8c75d3"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"1bc34b6e1502a67a7101d9421a6ee7d0bc4e759a1cb0ff939d617b2e196a5e8e"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"fe9242ba23d9eff51a8130571bcba6907f9c5eace911d442fee71ada5f0fe64a"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"1993357d076edf21520b69cdeff2b09d2e85b86f58185c919b2e065e2a589366"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"d8dbb8220d75372c547ff9d4558fab2ede58b49b2819925bb93398302edb3c5a"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"4aea80c282f6463ac5f5d6491bd76abec6c5c1d8704c5ebc42174cf251250a71"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"556ca41ea0faa00620b31a35af6731719f87f592d561406fa474b13af8bfba91"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"b9897b841975b9ccd32c800ba8bc44f7af27f39f71628c564dfe62b0ef62a88f"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"e2a485f6d1341968867aff96867de590dd049aaa59c47507a759e8fe23a655d0"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"6be2b2c5fa4cf146305a101bfa4c3216a10bf0053e2ef46688cf6a1bac2902eb"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"579a9184ff1b7a2d64c93264cadd1bea1dee9b675aeb369a113b11785a11a4d0"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"b32b3d736e362c3bd25bac0df105646f3786f4b88044e0790469fc95f99fdf9b"},{"file":"engine-parts/index.pck.part-014.bin","bytes":1266108,"sha256":"206e213180f8a09d3a33533e4633b3bd00227b6366f4238c3c8d997ce875d69d"}]}};
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
