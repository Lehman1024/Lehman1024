/**
 * Preview the cultivation profile README with GitHub-like sizing on localhost.
 *
 * @author Lehman+AI
 * @site https://www.lehman.top
 * @since 2026/10/10 17:33
 */

import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const assetsRoot = path.join(root, 'assets', 'profile');
const port = 8787;

function isWithin(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function page(readme, light) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lehman · 逐风者 — 修行档案预览</title>
  <style>
    * { box-sizing: border-box; }
    :root { color-scheme: ${light ? 'light' : 'dark'}; }
    body { margin: 0; background: ${light ? '#ffffff' : '#0d1117'}; color: ${light ? '#1f2328' : '#e6edf3'}; font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", "Microsoft YaHei", sans-serif; }
    .markdown-body { max-width: 846px; margin: 32px auto; padding: 32px; border: 1px solid ${light ? '#d1d9e0' : '#30363d'}; border-radius: 6px; overflow-wrap: break-word; }
    .markdown-body img { box-sizing: content-box; max-width: 100%; height: auto; }
    .markdown-body p { margin: 0 0 16px; }
    .markdown-body table { border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; margin: 0 0 16px; }
    .markdown-body table tr { background: ${light ? '#ffffff' : '#0d1117'}; border-top: 1px solid ${light ? '#d1d9e0' : '#30363d'}; }
    .markdown-body table td { padding: 6px 13px; border: 1px solid ${light ? '#d1d9e0' : '#30363d'}; }
    .markdown-body table img { background: transparent; }
    .markdown-body table td > :last-child { margin-bottom: 0; }
    .markdown-body a { color: ${light ? '#0969da' : '#58a6ff'}; text-decoration: none; }
    .markdown-body a:hover { text-decoration: underline; }
    .markdown-body sub { font-size: 12px; color: ${light ? '#656d76' : '#8b949e'}; }
    .markdown-body details { margin: 12px 0; font-size: 14px; }
    .markdown-body summary { cursor: pointer; margin-bottom: 12px; }
    .markdown-body pre { padding: 16px; overflow: auto; border-radius: 6px; background: ${light ? '#f6f8fa' : '#161b22'}; }
    .markdown-body code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; }
    @media (max-width: 600px) {
      .markdown-body { margin: 0; padding: 20px 16px; border: 0; border-radius: 0; }
    }
  </style>
</head>
<body><main class="markdown-body">${readme}</main></body>
</html>`;
}

const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  try {
    const requestTarget = request.url ?? '/';
    const pathname = decodeURIComponent(requestTarget.split('?')[0]);
    if (pathname === '/') {
      const url = new URL(requestTarget, `http://127.0.0.1:${port}`);
      const readme = await readFile(path.join(root, 'README.md'), 'utf8');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : page(readme, url.searchParams.get('theme') === 'light'));
      return;
    }

    if (!/^\/assets\/profile\/[a-z0-9-]+\.svg$/.test(pathname)) {
      response.writeHead(404).end('Not found');
      return;
    }

    const assetPath = path.resolve(assetsRoot, pathname.slice('/assets/profile/'.length));
    if (!isWithin(assetsRoot, assetPath)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const [realAssetsRoot, realAssetPath] = await Promise.all([realpath(assetsRoot), realpath(assetPath)]);
    if (!isWithin(realAssetsRoot, realAssetPath)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const svg = await readFile(realAssetPath);
    response.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : svg);
  } catch (error) {
    const status = error instanceof URIError ? 400 : error.code === 'ENOENT' ? 404 : 500;
    response.writeHead(status).end(status === 500 ? 'Preview failed' : 'Not found');
    if (status === 500) console.error(error);
  }
});

server.on('error', (error) => {
  console.error(`Preview server: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Profile preview: http://127.0.0.1:${port}/`);
  console.log(`Light background: http://127.0.0.1:${port}/?theme=light`);
});
