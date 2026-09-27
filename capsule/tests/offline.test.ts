import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync('dist/sw.js','utf8');
function worker(){const listeners:Record<string,Function>={};const shell=new Response('<html>Atelier</html>',{headers:{'Content-Type':'text/html'}});let network=0;vm.runInNewContext(code,{self:{location:{origin:'http://127.0.0.1:4173',href:'http://127.0.0.1:4173/sw.js'},addEventListener:(name:string,fn:Function)=>listeners[name]=fn},caches:{match:async(key:Request|string)=>String(key)==='http://127.0.0.1:4173/index.html'?shell:undefined},fetch:async()=>{network++;throw new Error('Offline');},URL,Response});return {listeners,network:()=>network};}
test('offline worker serves the cached app shell without network',async()=>{const w=worker();let result!:Promise<Response>;w.listeners.fetch({request:{method:'GET',mode:'navigate',url:'http://127.0.0.1:4173/'},respondWith:(p:Promise<Response>)=>result=p});assert.match(await(await result).text(),/Atelier/);assert.equal(w.network(),0);});
test('uncached resources fail explicitly when offline',async()=>{const w=worker();let result!:Promise<Response>;w.listeners.fetch({request:{method:'GET',mode:'cors',url:'http://127.0.0.1:4173/images/missing.webp'},respondWith:(p:Promise<Response>)=>result=p});assert.equal((await result).status,503);});
test('worker does not intercept third party requests',()=>{const w=worker();let intercepted=false;w.listeners.fetch({request:{method:'GET',mode:'cors',url:'https://example.com/'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);});
