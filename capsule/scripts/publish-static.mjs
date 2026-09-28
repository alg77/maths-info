import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const built=path.join(root,'dist');
// Explicit allowlist: only generated public resources are copied, never sources or user backups.
const names=['index.html','assets','images','data','icon.svg','manifest.webmanifest','sw.js'];
if(!fs.existsSync(path.join(root,'index.source.html')))throw new Error('Source HTML manquante ; publication annulée.');
for(const name of names){const from=path.join(built,name);if(!fs.existsSync(from))throw new Error(`Construction incomplète : ${name}`);}
for(const name of names)fs.cpSync(path.join(built,name),path.join(root,name),{recursive:true});
console.log('Version statique prête à publier à la racine : index.html, assets/, images/, data/ et cache hors ligne.');
