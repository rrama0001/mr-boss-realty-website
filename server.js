const http = require('http');
const fs = require('fs');
const path = require('path');
const { renderIndexWithShareMeta } = require('./server/ogMeta');

const PORT = process.env.PORT || 5174;
const DIST = path.join(__dirname, 'dist');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
};

function send(res, status, body, headers = {}) {
    res.writeHead(status, headers);
    res.end(body);
}

function serveFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            send(res, 500, 'Internal Server Error');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        send(res, 200, data, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        });
    });
}

async function serveSpaIndex(res, urlPath) {
    const indexPath = path.join(DIST, 'index.html');

    fs.readFile(indexPath, async (err, data) => {
        if (err) {
            send(res, 500, 'Internal Server Error');
            return;
        }

        try {
            const html = await renderIndexWithShareMeta(data.toString('utf8'), urlPath);
            send(res, 200, html, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache',
            });
        } catch (renderErr) {
            console.error('OG meta injection failed:', renderErr);
            send(res, 200, data, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache',
            });
        }
    });
}

const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(DIST, safePath === path.sep ? 'index.html' : safePath);

    if (!filePath.startsWith(DIST)) {
        send(res, 403, 'Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            // Always enrich the root index.html for crawlers/share previews.
            if (path.basename(filePath) === 'index.html') {
                serveSpaIndex(res, urlPath === '/' || safePath === path.sep ? '/' : urlPath);
                return;
            }
            serveFile(filePath, res);
            return;
        }

        // Vue Router history mode: fall back to index.html with route-specific OG tags.
        serveSpaIndex(res, urlPath);
    });
});

server.listen(PORT, () => {
    console.log(`Website listening on port ${PORT}`);
});
