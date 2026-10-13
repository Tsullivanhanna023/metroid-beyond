/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":57688808,"sha256":"7aca67c0846f712481696808c8810cd00604af767564f25a6565d188eff07a20","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"ee9bd026cd873e899640c23d68093fcce2ff9141b2764ef1bde5699d8ce6c2ed"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"622d2f7230cdb9b4cc2d7fe2afe7a4a9b938a40d3a5d948e3be7c296551d58ec"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"b9ee9ffa78db58ac4edadc587ca89ed6ffa528bda3ae49c27820ecbbf9f9525a"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"ff8bab60dd95ac7e2d48c543da7cc242a3a9d5ca9784e66fd598d3d9d5ba593b"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"3f5164d6d074b459a96311e9e00f805d069a20b38889ac25d3636243c3e72e24"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"379960577e58889ba6dd65cbd1061780ec51b78fc562a0230a46c8b056e73dc7"},{"file":"engine-parts/index.pck.part-006.bin","bytes":7357160,"sha256":"9b6b4ed7164c7e5e872bb572914d9e4548ecac38f0f4bbd23d9aad1a582f6ef8"}]}};
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
