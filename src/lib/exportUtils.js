export function convertToCSV(items = [], columns = null) {
  if (!items || items.length === 0) return '';
  const keys = columns || Object.keys(items[0]);
  const header = keys.join(',');
  const rows = items.map(item => keys.map(k => {
    const val = item[k] ?? '';
    const escaped = ('' + val).replace(/"/g, '""');
    return `"${escaped}"`;
  }).join(','));
  return [header, ...rows].join('\n');
}

export function triggerDownload(filename, content, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
