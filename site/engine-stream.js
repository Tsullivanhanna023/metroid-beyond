/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":67222228,"sha256":"e70b8d9689c5c720f1a02c15a4ba63a12b565adbc4d79d9730737f2e70cf5ad9","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"6c05a7c03b188193e5a465acd21b247ed7556a88d2395b1937db65639bf89da3"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"983eeb5f26bb296de4d4147583f8ca22499d28403552b95540d3931c19fb60a3"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"924e1a36229b70a82d063f8579b7f2dee8dd0e7d10307fc4534c3d5938533115"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"30873fe81367ed9d744c198b27298a0003b31fc3bee01e199d2d1aad5bd0af20"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"2a608a6fe97fc3a4be89f2c07335571731f76c9859bebb748d69e634aed785ae"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"57a6270c4a81405fae54d09c063c0edb03878f912dbb210b66cc128d4f82d84a"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"80c66efffd384955ebf87189f4489edca77fc2534627177ab35faaf811d9f66e"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"00ba47a3d2589acefc97e42346da3c0e932a6effe88672fb1d53e1b650cfaadf"},{"file":"engine-parts/index.pck.part-008.bin","bytes":113364,"sha256":"77b0cacb41134eab98537e9aaedbe60d7bb44d00e853c0e676ce91d720c7ce97"}]}};
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
