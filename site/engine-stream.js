/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":80520196,"sha256":"5772036f7e78146009e835374fca1c71e1a9bfe6d5ff707e0545c239b8c90021","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"ddfaa2316eb5caa8c6827569183bd5f9f5dbad596b119d3caace0a7c2f6ac302"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"32a613c7b4e196de5cb59d59750b0b5670c6e7fff4601098413c1c02dae4ddf2"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"5e0cffb4be063e845e4c20a5528d94b7d888af607792df76b305be1f45a1e565"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"d6998591b4780b62798222784149c2677ff20b0c578573b07996d04d6aacb947"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"a65157a505ba46f9f4bdb7bea1429cd34f4888f0e6cd829d849147da50987d67"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"13311b8e0f91679f78285da80b910c0a3d5b3567ec30ce51cc8317f235c17907"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"624ed85a81f988f172d99faf67f6d10dfd7a6348a3182682b9f36e8e205775d2"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"12597a9f20a2d16cc9b2c1f9d5bb27689c9950dfcafc40d7747c6027db243b78"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"0272a910cfdd3c59027fb2096e9e662c7084772a5f5cd7d861527eaa719867f7"},{"file":"engine-parts/index.pck.part-009.bin","bytes":5022724,"sha256":"02b52a021056b5219caf57e25ba19c3f8785362e86987e236a1dabe789e1027a"}]}};
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
