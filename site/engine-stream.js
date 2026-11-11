/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":154283696,"sha256":"481a96d5181ffc7b6e3de60e45ac4ba352de7c5b7b0e88a8ffcdac9cb7531ba9","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"7f08b154c7b7b31acb3c128b06f41705c365867a606fa3f2780781d994414dbd"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"e13a611782fa933bf3d07f9eb39146ac42d4c738f6fc6989c4ce5253275969d3"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"5c337f528b2f9dbe5fa89adb98e63a14d8a3f5d2ee62aacd9d0a2cdc7b40e51c"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"0717c355fc5109cbe445e5a9db8a01d418f7270e4b6c43b89996541871d9eb79"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"98436b05183bdec0d03b2976ee10913b7ea2d59f51c923bd1d6432d5e905d199"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"33592acb0b61ccdfa0e4377600fcee32749c555b2637bcb34c4a124c088335f1"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"d51c17e212a4d156a225937f695dbc7b6a30a77eb8524aa829ee413a897bb1d7"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"48e7a2d43345822f1a47d1e94b57de44497cbf7f3e95bb7226fafd92b3cc1e16"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"541d0cbffed8b3f3b2ff4f249905b39f4c05612c3b385708e1b269ae31ea1378"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"9b9aaa8295c826ce4a85c98fa855378a5fa0084ec3ad76883596be30b4135dff"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"f9d5be6c1e5e3777cd59ca203aa312e57baefd362630b4f5523527b0a086420a"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"e0bb2fe27e00e961db6cf97d96223e3168e156c7d091efba77ab32a2914d71a0"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"4bb49f290f48fd325e50116bf81ccc46c334685607e1eb90c41d80b8ea1ffeb2"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"ca173f8985a7f6feb70bffb70c5375f86d3cb7b753708f72490e2c3ba327da3b"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"fb1f4f5284a697e02bcead52ae766f4509f9a2be472a618f1dce8ed8dc08f4d9"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"521e3a904f227044095004c39ea0190b1f3c0d9d7eb28d769fc02449cdc2bb66"},{"file":"engine-parts/index.pck.part-016.bin","bytes":8388608,"sha256":"cfe62a4a1ad26fa2d0df2054c31043645dafc7496893e106b0f7166ab3fb4c30"},{"file":"engine-parts/index.pck.part-017.bin","bytes":8388608,"sha256":"b57cef2cb157272efc3e856a367acb9241e5c59ce0f97dc4ccdf2cc43cced1f6"},{"file":"engine-parts/index.pck.part-018.bin","bytes":3288752,"sha256":"9bd8bf4b09a9b37e2d6df473fb9f7ab14a3201a28c012f097b47598503e42c61"}]}};
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
