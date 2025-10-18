export function makeQrUrlForModel(modelNumber) {
  // Uses api.qrserver.com to create a simple QR linking to rating page for a model
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/rating?id=' + modelNumber)}`;
  return url;
}

export function makeBulkQrUrls(models = []) {
  return models.map(m => ({ model_number: m.model_number, qr: makeQrUrlForModel(m.model_number) }));
}
