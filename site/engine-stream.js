/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":74230772,"sha256":"ee5745def379e03735a730c9857a37543aae22b425f154b74ecfce18bb6e39fa","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"99db495588aa40037df57d0242652638c92b23fdd222b9304da74c0fae4a6b4f"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"4dcff886f78cf9af711247e1c0ece9ffa172bf0dde317b5b85edf987dbb9cfa6"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"77620f05919a95958f70515db03f63ee8e33465e0850eb33bb9fa79014c4e3ea"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"79d7eb6379b5e85b30ecfe77705c3d2689f91a7108a2cd9507b6b47c107c7da8"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"79cd34cae0fa4185f6a755e233d45b5dad6a850dfe1aacb587cb5b621889de27"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"5baa402b4c9396ed1f8520022fc3b4b7828ac96a42724765e732debf356aacb4"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"f71ae896e31100cded4e6993b8fc8a5e0e829da6cfc47f58f2ad69ff946bca4b"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"d7269677c8570b4fb3fd9e0dc77aee9cf0036ffce276b5e7531139c58d07713f"},{"file":"engine-parts/index.pck.part-008.bin","bytes":7121908,"sha256":"b70430cd3b0fa70e488df4f6dc0f4edcaa1f66686444a6979323f24c6842fa8f"}]}};
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
