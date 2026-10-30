/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":144502720,"sha256":"a32076cb7acda25de079fe202ea9453d128f2790320f50c0ad9a3dd9c36efde2","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"3b5ed7f8295ae17d4bdb5c6b42f40cde5d015aecc3000c13ff0accda997ecc2b"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"8d3474848d70e368887621a092b48521f9694789f70e6bc48d3a248efd0e04a0"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"f94ee49f49a3c592d9f0dbb78b1b7116010a2238f57e7673d1981c141d898f28"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"01ca1bdfe72f33f84fb47fa141d4149efdc07fee459da567bc9adf51a44c5cd4"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"4a26ac3a5a3837afc8aa38f64e8efd6cbce68830bb9c7b255af2d625415c4c7d"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"087ffb320498e1f3949ece61948c72d5c6d65473c722344083baa389dab5f25f"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"2a3353f9c39a641c44e992795ee69294512ccdff73c7d3a9a1deed004ecbd35d"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"ed378f00493b2b103a0441ff58a742cfbdd28c453dd3b7184a2d76f7cead7666"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"36f815452c7bb0452d1844625a53314332eee735bb4860ef31473e65090c1f5f"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"509af12536eb21b1cec945d7abe66a85ceb8373d97104633f0bc517ad9458a06"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"fd6add7bd11b40743a1e6d75608da1ec1dd8fb4f704cd918ef4299792ac8e9d6"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"52263406b12bb18df215bca20b118b38fa0dbdab76466d8fed9580567ca06cc1"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"e1d40be78121b196477929cbd3d19ca223b8d75907c3ca0de43151a46e62626d"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"241f8454d49c8a4b5488e5326eb11b878ccd209b97a84f098555a5366584a3ec"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"c6165de2c695f601f46c7c8b922edf7ca2b4c70c7389c382fff0208c4068b11b"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"5bddae23bdd71f3213994f0bd0473972ce1efc64c0c8c309598bc40a8038fb35"},{"file":"engine-parts/index.pck.part-016.bin","bytes":8388608,"sha256":"50fb983e18b59455738233d965cffbec64b58812faa19188cdea41c506522a1e"},{"file":"engine-parts/index.pck.part-017.bin","bytes":1896384,"sha256":"0d746e281ecbfc25261cdce843d6af333078b1ed7d33d4bf4a4b9c4b80bb0bce"}]}};
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
      chunkAddress.search = address.search || '?v=' + item.sha256;
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
