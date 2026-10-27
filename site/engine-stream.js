/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":140930608,"sha256":"7eb62a9b6514966d81fe1873c01f00980ccd6f94e858855be6e4a63b2de2d5cb","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"5fdb99b944e4bbb801299c4f949ede32e112e6778cfc81d828dc86b00d684d23"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"8d3474848d70e368887621a092b48521f9694789f70e6bc48d3a248efd0e04a0"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"f94ee49f49a3c592d9f0dbb78b1b7116010a2238f57e7673d1981c141d898f28"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"01ca1bdfe72f33f84fb47fa141d4149efdc07fee459da567bc9adf51a44c5cd4"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"4a26ac3a5a3837afc8aa38f64e8efd6cbce68830bb9c7b255af2d625415c4c7d"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"087ffb320498e1f3949ece61948c72d5c6d65473c722344083baa389dab5f25f"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"2a3353f9c39a641c44e992795ee69294512ccdff73c7d3a9a1deed004ecbd35d"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"8e33d2162622d2a657d74e8646f95f01b0dbd4201df10d4f142489434676cceb"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"a5b35557f27b3029fd5d3c1d262d932f5141e514e603a72f6535813909edd8ce"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"fd8f1511d54217a6caab146f830bad071e0d94290c4a0a5d4353b4b1db1605bf"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"082e40c9001abc207751b7bb549cb854e542d60a1b4e95644a5069c53189e1e5"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"b315b656bffea1c03a0aaa34bf656f6e3b3a4435484b4e84d9c971a07dac4193"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"62cdebc04b32d49f442cfc145bb9c21d5777e791d78586dae1991ed1a73aaee7"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"39d227a84ebd75bcc611f3ab8a8a684808f2e80c3e34868b28791613722afa31"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"2712346c991c08fac406d1683f0033597fa3ec1a698726681c8dd665fc6d1f3d"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"120c67c91765de580480bbee7d942fb7eb8f62d3fef203b3342dc858d13fee20"},{"file":"engine-parts/index.pck.part-016.bin","bytes":6712880,"sha256":"4a19a5d5856eefcf389313829f0fbab989aeedd36f425bc53c17116e91402d9e"}]}};
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
