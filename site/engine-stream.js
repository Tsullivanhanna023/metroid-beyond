/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":151989892,"sha256":"d04a93beb1e20415eee8d5fb975c4724d5f2cd2fce9c88de9089ee0ad202e2db","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"42a738ddc99903d9a1671edaea37dcba39b923e3d5dd9d061237f82fe7c3db25"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"e13a611782fa933bf3d07f9eb39146ac42d4c738f6fc6989c4ce5253275969d3"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"5c337f528b2f9dbe5fa89adb98e63a14d8a3f5d2ee62aacd9d0a2cdc7b40e51c"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"0717c355fc5109cbe445e5a9db8a01d418f7270e4b6c43b89996541871d9eb79"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"98436b05183bdec0d03b2976ee10913b7ea2d59f51c923bd1d6432d5e905d199"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"85d58d77b8490dc8912a9505ac706bb529482a983a37ad06c1249ec5adcf656e"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"c22ab0e099aa0b7d7786af80a577da211212fe45d6ac9b46b31e30d3fd0a894d"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"d101b43c43d3cd47e8ab8f09a520dc815aa94358d1a2c8c98d16817ab703a0a1"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"114229dd883ede41c24c47fee33b962b4d5a4c522d01e4a228b5af7764230c44"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"06bbaf94a65221e5f6c73bf4b1b0484c1421d0e15cb6e8dadc077ea8e58bc88e"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"086a7dd822ed135d469bcf351edc33dbc5542fd3113d7230820a48a0acf2a11c"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"6b31289ed2b05aae8330b4ef5de574a23d340ecaa279beaf51be5693399b5018"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"a900d6f2ff2a527330d5d90f14bace43a98a16def70f615cfa5eb190855892bc"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"e77e1ac43febd7a99660cff161721e067a7e43350c8454f476542f82bb909142"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"87adf862f15baa37bc45af93eaf2e524cc0dc0c5941655ec0858e975a95e2cd9"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"e57718ba3a7cd95da6c3b329557a2ec06583f9a9f005b0d049382b94c84e0331"},{"file":"engine-parts/index.pck.part-016.bin","bytes":8388608,"sha256":"f6b8efa89fa25fe3829f0cf58990b0d3fa008d47cc16ced9396c82e35bcff5aa"},{"file":"engine-parts/index.pck.part-017.bin","bytes":8388608,"sha256":"f080989b50d86b2966e9935ffb14efe5d7d5553391d03b7ea1f2a1068ed92469"},{"file":"engine-parts/index.pck.part-018.bin","bytes":994948,"sha256":"56df6518bfb0684b2170f4f02b72e922e518ec22a26c739f4817356089605a0e"}]}};
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
