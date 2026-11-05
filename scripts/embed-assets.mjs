import {readFile,writeFile,mkdir} from 'node:fs/promises';
const files={'/':['public/index.html','text/html; charset=utf-8'],'/style.css':['public/style.css','text/css; charset=utf-8'],'/app.js':['public/app.js','text/javascript; charset=utf-8'],'/cipher.js':['public/cipher.js','text/javascript; charset=utf-8'],'/assets/pool.webp':['public/assets/pool.webp','image/webp']};
const assets={};for(const [url,[path,type]] of Object.entries(files))assets[url]={type,data:(await readFile(path)).toString('base64')};
await mkdir('worker',{recursive:true});await writeFile('worker/index.js',`const ASSETS=${JSON.stringify(assets)};\n`+await readFile('server/handler.js','utf8'));
console.log('Embedded public assets only; private content remains in runtime secrets.');
