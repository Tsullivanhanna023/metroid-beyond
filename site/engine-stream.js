/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":123291660,"sha256":"8e9a5dd8ecfad391f16574b0337ccf0861584fe3928cf74b15781777c251d14e","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"f9de25da77fd3834194681631cb984602377a4974cf3034aceab4b8cfbf3aacc"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"081f3c49bd226d421303916dbd22478af6239327cb278581d5d534824f09c143"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"7b7c6c1427139c8010b1619355eec5c62a56d9da55a8bafef51904113d8c75d3"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"1bc34b6e1502a67a7101d9421a6ee7d0bc4e759a1cb0ff939d617b2e196a5e8e"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"fe9242ba23d9eff51a8130571bcba6907f9c5eace911d442fee71ada5f0fe64a"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"475e807673c660f89b7db10c73dbc20ceffcf0a90e5ab050aea4e6702224b372"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"17009cb9bba3005dd3ffe361c2849beeff6f6b971ce531b39ce526efed71c1f1"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"6c8a5710c33afbfc90d5852969e07e91fe4c299150898b56b2cbb33cce3d0826"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"d5b72f68ef48185e21bf86d78b8cc0d4661dad1dd6a120cb1658caf0baaeb9d1"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"a4222d3eabbda3aca7de02a65d110256192730129d9c4e1564c60f34ece7251c"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"b4a450798cf9e4db40c7f4e5d59d62156dfcbd6c102cddca4a73e60e034b1eea"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"400bac774ba9ccc5b0c4d6a0c8478e7608ad05dfc56fa712c4493993ac9a7db3"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"6a79c5351d69a2f29c404a4e41cfa2dfe1c682404a2a271fc8489783a2b040a2"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"fe5d59ac3c2770512e733ded391687b989cdfccf527ca0092ce65c7795e163e0"},{"file":"engine-parts/index.pck.part-014.bin","bytes":5851148,"sha256":"85e946b5196a52692e5a49cafe0afd583a46d1acfe08ec9f013b0f0bfa9a759f"}]}};
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
