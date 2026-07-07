(function(){
  const manifestUrl = '../../../../references/nsi/ece/manifest-ece.json';
  let promise;
  window.ECEManifest = {
    load() {
      if (window.ECE_MANIFEST_DATA) return Promise.resolve(window.ECE_MANIFEST_DATA);
      if (!promise) promise = fetch(manifestUrl).then(response => {
        if (!response.ok) throw new Error(`Manifeste ECE indisponible (${response.status})`);
        return response.json();
      });
      return promise;
    }
  };
})();
