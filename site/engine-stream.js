/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":105913948,"sha256":"2ab1891ef7a5fd927f3e152ea5218576ded8d6ad8fb223986f9639afb8777b49","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"d7b2e3d93464d17fa158f0832e91854acbfde6acd8384b30edc999f7cf4e5e7b"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"a1c6e94487ed9b12f0314908975c48a1f4bac5e63f91c19cbbdc65d1826882ad"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"dd88cc6e14d31adae1148e8c33cb5822f78eb9b95f94d8a75b0de5a8298b673b"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"417c424f16f183afe9d246e42719a4f7af0a255696341fe03e1b484c3bb3a2c3"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"09c0cf6ba2dabdacf51fa6da38ffcaf732e971951bd07b62aebd34501c350779"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"6080af093e6c60261562bacba94f3d8ab292bb3aa40f8491155a4b68d5a87d79"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"306074293f5d92349493f857e2e2fad21bb527cad7aaccfb457db5336b2bcfdf"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"080a763e7979b7fd7c1aac5831b3b960c78cefa3db6283196a3213d4bff68cd1"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"0c65906a43f33da6d09da4477ffe84cb78d653e2a01cd007a59b411ec01773b3"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"e140880ab3016359f57257a45dc4dc5f93e4f2cd8b777f4c4b95445a2d6528fb"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"515b21d6dd35c53a546e25c2583661bffd6cd3f1168b6242e6f0bfae9e94c6ba"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"7a8b4f0c7d74b8cea1cd8e03dd410613f96285afb8beeb38b3084bb7748daf4d"},{"file":"engine-parts/index.pck.part-012.bin","bytes":5250652,"sha256":"0f6499893a044d1835d73c2df1efdd19839f7d4061c68f4e5856711117de809a"}]}};
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
