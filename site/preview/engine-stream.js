/* Browser hosting adapter. Engine and game bytes are unchanged. */
(() => {
  'use strict';
  const files = {"index.wasm":{"bytes":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","mime":"application/wasm","chunks":[{"file":"../engine-parts/index.wasm.part-000.bin","bytes":8388608,"sha256":"8a56546b5f9b9137e80adde4400b797a5189062dee30d2505871ebd8e83987d3"},{"file":"../engine-parts/index.wasm.part-001.bin","bytes":8388608,"sha256":"62901720225c5663e708a233614396a6943357de7c98cead67f11669773dccae"},{"file":"../engine-parts/index.wasm.part-002.bin","bytes":8388608,"sha256":"c14dee0b88ada7bc7b4b48f3b8ae20e16922818417292b06082484fe183ae397"},{"file":"../engine-parts/index.wasm.part-003.bin","bytes":8388608,"sha256":"ca498a54fdb112b659cf23bc79a932e58d350a0f4cc8fabb639f230233ad6c72"},{"file":"../engine-parts/index.wasm.part-004.bin","bytes":5960322,"sha256":"219249da87c3cfda9a89fba24e253e60d6efd5191d0b108120ad93e51e54d707"}]},"index.pck":{"bytes":153687380,"sha256":"cda2f69a59214d95413c8fcf8cd915c4a506736b2c7ed89de62b4eab9e4bef86","mime":"application/octet-stream","chunks":[{"file":"engine-parts/index.pck.part-000.bin","bytes":8388608,"sha256":"bcd6adf017f25a001248654907e34340ea83aa7fd3a0966c0481ee6ab228a00a"},{"file":"engine-parts/index.pck.part-001.bin","bytes":8388608,"sha256":"e13a611782fa933bf3d07f9eb39146ac42d4c738f6fc6989c4ce5253275969d3"},{"file":"engine-parts/index.pck.part-002.bin","bytes":8388608,"sha256":"5c337f528b2f9dbe5fa89adb98e63a14d8a3f5d2ee62aacd9d0a2cdc7b40e51c"},{"file":"engine-parts/index.pck.part-003.bin","bytes":8388608,"sha256":"0717c355fc5109cbe445e5a9db8a01d418f7270e4b6c43b89996541871d9eb79"},{"file":"engine-parts/index.pck.part-004.bin","bytes":8388608,"sha256":"98436b05183bdec0d03b2976ee10913b7ea2d59f51c923bd1d6432d5e905d199"},{"file":"engine-parts/index.pck.part-005.bin","bytes":8388608,"sha256":"5b1f4bd29bac8e8149d65e57dd5f3580c9ccb84a539b89373bb890286140f169"},{"file":"engine-parts/index.pck.part-006.bin","bytes":8388608,"sha256":"579c948b6c29826f44f58954de974ec2301b217308af65470a6780c51308f1a4"},{"file":"engine-parts/index.pck.part-007.bin","bytes":8388608,"sha256":"2437dd5d53a2291d3e69d5709217863a03bc5750590640a837f2cf5069d3ccb6"},{"file":"engine-parts/index.pck.part-008.bin","bytes":8388608,"sha256":"074af22f6b3843bcef1d36b9a069e3584f75f385624fd9aa5fbbc3acdafae7ec"},{"file":"engine-parts/index.pck.part-009.bin","bytes":8388608,"sha256":"1eee0e954144172444a42111e97e0812c01fdbcb6af4336a94a19899b713b9ca"},{"file":"engine-parts/index.pck.part-010.bin","bytes":8388608,"sha256":"241db41034ac4b23c8018cd128468d8c40ea60e5f0dd68ce65cb54c23245edd6"},{"file":"engine-parts/index.pck.part-011.bin","bytes":8388608,"sha256":"efce9b6433a9cc54c97eb74c5d24fa266141d714dd1df0526e8b415342967ba9"},{"file":"engine-parts/index.pck.part-012.bin","bytes":8388608,"sha256":"b86ad5033cf9886b2d95495c7a7414f9edc4fc654a283e4ab0252401f66e22fb"},{"file":"engine-parts/index.pck.part-013.bin","bytes":8388608,"sha256":"98ba0d6255f34cea9d51f0851f48847c89954bbeefd571fda788aec5be87cb9c"},{"file":"engine-parts/index.pck.part-014.bin","bytes":8388608,"sha256":"6439da4d9faff44c52f6d48ae4e869ea241d17e711661d33d83a5e2f141af6e5"},{"file":"engine-parts/index.pck.part-015.bin","bytes":8388608,"sha256":"edd535b59568a9c6e19b9690918c22c2268a3286598f1a49453d73cd5f7a60da"},{"file":"engine-parts/index.pck.part-016.bin","bytes":8388608,"sha256":"d3f7bfeed1c292744b1653ae08772fa1ccec72d92af3d057676c497c1d7d1c43"},{"file":"engine-parts/index.pck.part-017.bin","bytes":8388608,"sha256":"6d70e668048e5a96660fdfc9337c2e8327143d19ee90ac03c6f8884492fd4770"},{"file":"engine-parts/index.pck.part-018.bin","bytes":2692436,"sha256":"69ee6bca6162d7a5293da8f094b4b64bd1061c26d6ed459296a280fa3bfc24ed"}]}};
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
