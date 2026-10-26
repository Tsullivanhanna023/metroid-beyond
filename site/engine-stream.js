/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":118714012,"sha256":"f0ae833138bd027a3bd4ab86d5b2091d2dc59953564a8a1cc36ecf7f647ddc7d","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"4deb88d6b9f9f8b0d70f423330ede52be744cb1e46776bd9793ef701d523482f"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"081f3c49bd226d421303916dbd22478af6239327cb278581d5d534824f09c143"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"7b7c6c1427139c8010b1619355eec5c62a56d9da55a8bafef51904113d8c75d3"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"1bc34b6e1502a67a7101d9421a6ee7d0bc4e759a1cb0ff939d617b2e196a5e8e"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"fe9242ba23d9eff51a8130571bcba6907f9c5eace911d442fee71ada5f0fe64a"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"1993357d076edf21520b69cdeff2b09d2e85b86f58185c919b2e065e2a589366"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"d8dbb8220d75372c547ff9d4558fab2ede58b49b2819925bb93398302edb3c5a"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"c5604c40a108c8a01ea452bb7c127d5377c3fb7eb65dade094f49ca38c21e62f"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"8b25e6ad813443e7e13a381e95f939eced8472bc7b505361c614f0888bca9f4d"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"08e596776a618ea864f1f4ea2d14028e17cd45d89c1100613afb20722644bdf7"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"65f3687c142f8874c3e74d3570053094e5af42497e4042e2ff4f152533f5a654"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"753cc100d9b8eb9e590475a0c599dc09c58f9852b20703e2e0184edc73e14853"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"5339a4352e164564b20e52998f09f996392014ca9df5bc2e4b7e11f4f082c729"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"7b1888498036f3d541d4f7ac5ecff3602fcd7809f2791245df691c8730e0db6b"},{"file":"engine-parts/index.pck.part-014.bin","bytes":1273500,"sha256":"5a88fef541e456e46838bbbcdd468cf68ad52ca9126b380b51f423bef6c73143"}]}};
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
