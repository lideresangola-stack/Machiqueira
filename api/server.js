export default async function handler(req, res) {
  try {
    const { default: server } = await import('../dist/server/server.js');

    const host = req.headers.host || 'localhost';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const url = new URL(req.url, `${protocol}://${host}`);

    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });
    }

    const requestInit = {
      method: req.method,
      headers: req.headers,
      body: body,
    };

    const request = new Request(url.toString(), requestInit);
    const response = await server.fetch(request);

    // copy status and headers
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      // Skip content-encoding as Vercel will handle compression
      if (key.toLowerCase() === 'content-encoding') return;
      res.setHeader(key, value);
    });

    // pipe body
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    console.error('Serverless bridge error:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
}
