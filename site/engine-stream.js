/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":142725100,"sha256":"f47918a3e9fcc2eec6af042f72fad81c140ee09e3079844931c5a3a8a9d35f4e","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"e430cf7a7959c69c7a4d64d5f8d2bb63ea25bfc86c1521a9655347e7f7f14b77"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"8d3474848d70e368887621a092b48521f9694789f70e6bc48d3a248efd0e04a0"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"f94ee49f49a3c592d9f0dbb78b1b7116010a2238f57e7673d1981c141d898f28"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"01ca1bdfe72f33f84fb47fa141d4149efdc07fee459da567bc9adf51a44c5cd4"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"4a26ac3a5a3837afc8aa38f64e8efd6cbce68830bb9c7b255af2d625415c4c7d"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"087ffb320498e1f3949ece61948c72d5c6d65473c722344083baa389dab5f25f"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"2a3353f9c39a641c44e992795ee69294512ccdff73c7d3a9a1deed004ecbd35d"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"8e33d2162622d2a657d74e8646f95f01b0dbd4201df10d4f142489434676cceb"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"09ab7bded15de5ff83746adb05c37cd32224782ebf75b031ab52bfadc2985139"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"ae58cb54c29417f09d0f7798962816b2e9562cb5b1fff065cb22230495c426bc"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"54ef536b7425d17c251adf85caa759043b67d613045904784944eca9ba2427b7"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"a245fff4bcb3003f25e13b1380ad7541f297e72641b5d363a092674493a5de0f"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"92b1164ecdfcc10dfeda3c6710fb50315ab6caf3d7e446910a79127992bbf9ba"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"ba9f9b8210697f5aff4770fca0c6b1b418c5d5b4f9f5031bdcc226c2d57c75fe"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"04e33923c4ecd13a0cf4e48ccf5af5a9676f23cac731fbffd06f97b6d62c34b4"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"2c8ec24512481b7e3708b3a58fd29efd17bac45c0a89cffaf42b07f71b41add0"},{"file":"engine-parts/index.pck.part-016.bin","bytes":8388608,"sha256":"810c0606868d8fff98f2975df408a519b1b33a9efef0626fb386203cddf8c762"},{"file":"engine-parts/index.pck.part-017.bin","bytes":118764,"sha256":"6988e32afe996aac5d989be3472649e13b2aebd02ca910e58d30787ba26a1f9e"}]}};
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
