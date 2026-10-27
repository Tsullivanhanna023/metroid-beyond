/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":138514848,"sha256":"b464b1a217f9dddb488984eb428c26a724434adaec4ec709914535e2ee241ba4","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"c98887fe4842acaf32e29b83292b28319c5ac35697fa45332b5adf55fd4b487e"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"081f3c49bd226d421303916dbd22478af6239327cb278581d5d534824f09c143"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"39476d4f3ef8681397cc1d5ff09645e1f6ee20ac9ca7494540f88e7f13ab1dae"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"118ebeca26284b2816b924ccf11da6707d07d2b756e1802a7cbcd2e5e478f968"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"5ac82cf6bc1403b539cbd93db385e4e1e5a228c2889be22cc765ffd8500e2f42"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"f1601cd6c63cf9cd85680f84090c010f345b116f454774c46960491c8824602a"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"24c3b62cbc982d1ddb6c53f73e1b161186f0c9aeabb6d49801bbae25d26c8ed6"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"d705232e6f74058bf28d874daeab43dc0bb7c1e6fcd8d27938ea81682e63e679"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"aeab005d1f6511053f86afc884a257cbb93d5bd0f789444683bb66b51a01bf00"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"d2af0dc515661440362d1cdf69445b0ab7db3dd48b19dd703c463661a0493f7b"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"b7a7334296693689d256fcf02eaedc4d317cb4437c6eee723aecb016bf3b83e7"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"a35cf984180babfb1a3935b94fbc2859211539dba2c2a2c629853892bdb67315"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"0a85800cb59fb10b551f3d4dcfe1c9d8f5e3b2f763a6c933f26496ddcee7b272"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"793daef895b90c7f17be4a89b68c2750ff74ffe37776a0e45b494806be8f2b0a"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"11a1da2d2e28b827cff8833a4c01b7e059356ae0023f15d61a887068077c8e28"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"8804e3b5dedb878674cd65aaa6d2750f0eb0d9591046a8fb1c04cf5567bf38dd"},{"file":"engine-parts/index.pck.part-016.bin","bytes":4297120,"sha256":"87b0eb80eaaaf99117d7a692ac79a4b6d2e5b60e39c88960a61545184db2586f"}]}};
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
