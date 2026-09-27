import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((f) =>
      f.isDirectory()
        ? walk(path.join(dir, f.name))
        : [path.join(dir, f.name).replaceAll("\\", "/")],
    );
const files = ['./', ...walk("dist")
  .filter((p) => !p.endsWith("/sw.js"))
  .map((p) => "./" + p.slice(5))];
const version = crypto
  .createHash("sha256")
  .update(files.join("\n") + fs.readFileSync("dist/data/wardrobe.json"))
  .digest("hex")
  .slice(0, 12);
const code = `const CACHE='atelier-shell-${version}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('atelier-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith((async()=>{if(event.request.mode==='navigate'){const shell=await caches.match(new URL('./index.html',self.location.href).href);if(shell)return shell;}const cached=await caches.match(event.request);if(cached)return cached;try{const response=await fetch(event.request);if(response.ok&&url.pathname.includes('/images/')){const copy=response.clone();event.waitUntil(caches.open('atelier-images-v1').then(c=>c.put(event.request,copy)));}return response;}catch{return new Response('Ressource non disponible hors ligne.',{status:503});}})());});`;
fs.writeFileSync("dist/sw.js", code);
console.log(`Service worker : ${files.length} ressources, cache ${version}.`);
