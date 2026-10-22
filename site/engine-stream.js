/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":105906092,"sha256":"335916d02b05b254469b5e45bd6c8dbeebc0a55a31297a391dafacc71c88c6ef","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"3c25407f2af3a07efe9f10bef14613ebbd6aec4a3283c1f6bf04ff2a88e8776f"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"a1c6e94487ed9b12f0314908975c48a1f4bac5e63f91c19cbbdc65d1826882ad"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"dd88cc6e14d31adae1148e8c33cb5822f78eb9b95f94d8a75b0de5a8298b673b"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"417c424f16f183afe9d246e42719a4f7af0a255696341fe03e1b484c3bb3a2c3"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"f99835ab6477f69be9f8674550b453b7943d9b1ddbdbad8e5c1f4a68494a9198"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"79d0af8ae7c6f5ef5d32500cab8f9c583125d421aa24a1b83c4e39d4f1e5440b"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"57d27d8043e05e969523d4821a4763fbbf298a905f0106fcdfc2d41f5c6999b8"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"e75534c4ec74d95c916f2d9c044b766520c3645168387896ad8b91e41db5006f"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"3686ac9b95ed471e6a3c9425b947ce0f65cf77581966680ac257503fa8e8a4b9"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"c466a2796a0f321318855375fa627a08747da7dddf9927426e9a8870aac31988"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"fe5ee3b332652d998d1b5e4682e5f9b4c7176136bae21d95cc6557c5260cc8ef"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"65f333800ea06ce9ddf8bb64be7c1525b4dc62a65968c0ccd41a519c397743b7"},{"file":"engine-parts/index.pck.part-012.bin","bytes":5242796,"sha256":"dcdc9e8cbff41689658de06336fa2f6aa30eca4b8ffad47527725d41b491f93c"}]}};
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
