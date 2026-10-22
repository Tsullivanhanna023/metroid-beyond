/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":103494392,"sha256":"3679d301681d7884d7e3a8c5b8d7fdbc3744d9ff47ba4b24da1612a21d65368f","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"66a9aa8dc22105e2970e5dccaace9c93f0ac43d85369a00d739a2e2d85858fdd"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"07049c2e60376b794ec00a017c0642ef92a10fc7b10c337e998a9b722230c5e0"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"0dd09497fa70c9b4a8a8ed553cc1e8b0f8c81b43da1128035595afec43a7b181"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"098c5ffc7ffe47b1cf013d05645de255addc2746594adce488f914a2e9c82a87"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"4afd4f5a7804462eb5aeee1b28424618f93b0e9d6cbc8e20616bf9d9ba5489e5"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"e22ba4c9effd535aad3ce72e005361b93d3cceb2f0f1d90a1a3be4c03e7957e3"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"8b3e4cc49905f16295bdce4c81ae555fb617328235b4684511586690b4ee6f51"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"bae3af37745dcc75af88b85f680939473a54b33fb2a6363ab793c432fd00ab19"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"2aec3114fbd3f1b97f3493ab023980f8b8d3fcddac4959a269bd44afd32661e3"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"80c295c1cfce22869df753888b97e345eccb43bf44cc3e06028e2f935b0318bb"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"a5e10f9017bf92e3dac94e924a6adc18c18007698cfa4b1ae32e1194a0e818a8"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"90917bee756c1282664b73eae57151091658f7eb6c1a4de5d62e977970361ce7"},{"file":"engine-parts/index.pck.part-012.bin","bytes":2831096,"sha256":"c2deb78d966f3724c0c16cd2180d93f719fba15baee79aeee5396660e1661cc2"}]}};
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
