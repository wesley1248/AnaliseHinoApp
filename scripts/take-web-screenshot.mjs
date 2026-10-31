import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const url = process.argv[2] || 'http://localhost:8081';
  const outputPath = process.argv[3] || 'assets/web-preview.png';

  console.log(`Buscando abas no Chrome DevTools Protocol...`);
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  console.log(`Abas encontradas:`, tabs.length);

  let targetTab = tabs.find(t => t.type === 'page');
  if (!targetTab) {
    const newTabRes = await fetch('http://127.0.0.1:9222/json/new?' + encodeURIComponent(url), { method: 'PUT' });
    targetTab = await newTabRes.json();
  }

  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const currentId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === currentId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: currentId, method, params }));
    });

  console.log('Habilitando Page e configurando Viewport mobile (iPhone 16 Pro Max - 430x932)...');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
    mobile: true,
  });

  console.log(`Navegando para ${url}...`);
  await send('Page.navigate', { url });

  // Aguarda 4 segundos para o React Native Web renderizar todos os componentes
  await new Promise(r => setTimeout(r, 4000));

  console.log('Capturando screenshot...');
  const result = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(result.data, 'base64');

  const absPath = path.resolve(outputPath);
  fs.writeFileSync(absPath, buffer);
  console.log(`Screenshot salvo com sucesso em: ${absPath}`);

  ws.close();
}

main().catch(err => {
  console.error('Erro no script de captura:', err);
  process.exit(1);
});
