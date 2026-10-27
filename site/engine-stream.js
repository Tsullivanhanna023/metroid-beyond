/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":138529232,"sha256":"f46c3a9787efaf9accba3a9f332b96e96042dc4b155c763b07e871f62978e254","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"e5e012854ed5af04d98b87f653d3f23e50bcdaad3d5b854631a0a65ebc9e35be"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"081f3c49bd226d421303916dbd22478af6239327cb278581d5d534824f09c143"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"39476d4f3ef8681397cc1d5ff09645e1f6ee20ac9ca7494540f88e7f13ab1dae"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"118ebeca26284b2816b924ccf11da6707d07d2b756e1802a7cbcd2e5e478f968"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"5ac82cf6bc1403b539cbd93db385e4e1e5a228c2889be22cc765ffd8500e2f42"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"f1601cd6c63cf9cd85680f84090c010f345b116f454774c46960491c8824602a"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"24c3b62cbc982d1ddb6c53f73e1b161186f0c9aeabb6d49801bbae25d26c8ed6"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"d705232e6f74058bf28d874daeab43dc0bb7c1e6fcd8d27938ea81682e63e679"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"e2b1a07f6f3cc402a1174656e887f9558c611cb5d0941813f36d968ea6914637"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"4b71b6bc2830168d81985841622848065b8e8e415bb14b89e4435d3c40ad8bcf"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"7e1641ea9b5e1fd2b248fe3d74aad8ae003a2ee16b718706a3284c5fd70c54de"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"569ec99054f79bd0f1e05970c2384fb5ea74168fa3d79ef5e36a06aa9d93ac86"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"c3e47ca7c3addc51f7254bebaf8b339fdcf7cb14689ea27a22c2dbf93bceaa4e"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"755359b59248c2438d02ee74b0cb63dd4178427058561dfc652f29f94abb5e48"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"7345371ad4af6ae14fc13bbffed3d83817d63034fae7329013b94ca69add339d"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"b57284927fcb5daf0ed78d851be5c874412f3e265c38d69d5904cd139c570e9d"},{"file":"engine-parts/index.pck.part-016.bin","bytes":4311504,"sha256":"4dbc3f9775cde8d0aef165860d19f9414dd7a1f355d9739dcf88ef64ac6773f8"}]}};
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
