/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":118694196,"sha256":"3f97411298b74522fd53bc3f1b4061ea025dbc42cf07d2d1ff0b625c5e54906d","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"34f7dcdc1c5a7028765262bae47764607a1bbaf397a8de2017fc8408555b50dc"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"081f3c49bd226d421303916dbd22478af6239327cb278581d5d534824f09c143"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"7b7c6c1427139c8010b1619355eec5c62a56d9da55a8bafef51904113d8c75d3"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"1bc34b6e1502a67a7101d9421a6ee7d0bc4e759a1cb0ff939d617b2e196a5e8e"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"fe9242ba23d9eff51a8130571bcba6907f9c5eace911d442fee71ada5f0fe64a"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"53421a0526bc02397c31acb1c6da12f4dff940347ef9fd1845f1a3d2f1597518"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"e53d90d7b843905a115e4b8874182bb9122406cb4c4b98a644eb82520e6195ea"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"d71288cd571a2df550578f52abeee926976aaf596f73ba4f1559ca97efe2ce78"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"a66050ef0bab15b432aaa809f0db81fff9a3fa8c17d1ab60d791d924a14912da"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"ee4bf4dfcfac39b4b411ba08192eefc7a54caa06ada435bf5a286e3a22b531a9"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"3eb548c8ef672afe497dc06e243c675f1ad51c58e07051ae8428bf9b0a580a2a"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"0b1a8d29cdc36c07356fdcae2f2dddebfd3d519cfdda492974e6d810a4363d81"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"e73efcefea9c331f1a46dbd12ebbbc6a97cda993710f18aa178ff7da6ff37c92"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"8d3f4472bb2411ddea80271e1b9487f38950fce6dd27dd026971ef98b6e59682"},{"file":"engine-parts/index.pck.part-014.bin","bytes":1253684,"sha256":"3e52b2f6a5d272e85019859d5a9a1f5f9af1e777baeed3035d2b38df77c1fba0"}]}};
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
