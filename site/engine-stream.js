/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":105914492,"sha256":"812a00cdea239e35c3220491a7f85f1a7e4c487540890bafb066911759f08f0f","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"50b43a8dd7d484b7f36dd39badf520643048cb07dfad07c69aa42555e24fb95e"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"a1c6e94487ed9b12f0314908975c48a1f4bac5e63f91c19cbbdc65d1826882ad"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"dd88cc6e14d31adae1148e8c33cb5822f78eb9b95f94d8a75b0de5a8298b673b"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"417c424f16f183afe9d246e42719a4f7af0a255696341fe03e1b484c3bb3a2c3"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"67cd2b33c6ee72d56d4b865417902b2d63f47694d779b8b47f0d2dd11d105ac3"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"2b9bc497cc5a0988b8c490f001e95dc87a1e8ce12b89e235096627e7c5e80a1d"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"1cfc17587644dee8e752504a1d9794695d445c103cc4fef1fe1a6b080ddc618a"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"0f19ceec124d4b53ff9ba4ab0f79ad8b9df782e61b4d658d7d59d0c0394fa5f4"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"ef596bdc0c9e6bcb5f8f5a59a49e3bbb2e49d955fe3d7a400967a231332040bd"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"47101de82bb5dec265719d3f4267ee7392f3246bf285fdaa318e6bfc69c9e8e9"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"384bb5cc07876cf3ce8e75981f9000da492b6b7a788a7c96a74db34704e6e8e1"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"6d343f92b59d291fae88437390f52bf96a8166f9a14d8db20d2bebe4b5816c1b"},{"file":"engine-parts/index.pck.part-012.bin","bytes":5251196,"sha256":"aaa67a24eccb0e3cebadae06388ff6c2168854c37fac876af99345cdec7f47db"}]}};
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
