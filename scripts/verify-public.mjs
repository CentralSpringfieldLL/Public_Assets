import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'hosting.json'),'utf8'));
const args=process.argv.slice(2);
const mode=args[0]==='--github'?'github':'cloudflare';
const base=mode==='github'?'https://raw.githubusercontent.com/'+config.repository+'/'+config.productionBranch+'/public':args[0]??config.canonicalBaseUrl;
if(!base||!/^https:\/\//.test(base))throw Error('Set the actual verified Pages/custom-domain base URL or use --github for temporary repository URLs');
const local=JSON.parse(fs.readFileSync(path.join(root,'public/assets-manifest.json'),'utf8'));
async function get(url){const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'Cache-Control':'no-cache'}});if(!response.ok)throw Error('Public GET failed: '+response.status+' '+url);return response;}
const remote=await (await get(base.replace(/\/$/,'')+'/assets-manifest.json')).json();
for(const asset of local.assets)if(!remote.assets?.some(r=>r.key===asset.key&&r.sha256===asset.sha256))throw Error('Production manifest is missing the current asset identity: '+asset.key);
const results=[];
for(const asset of local.assets){
 const url=base.replace(/\/$/,'')+'/'+asset.key.split('/').map(encodeURIComponent).join('/');
 const response=await get(url),type=response.headers.get('content-type')??'',data=Buffer.from(await response.arrayBuffer());
 if(data.length!==asset.bytes||crypto.createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Public content differs from the file staged: '+asset.key);
 if(asset.contentType.startsWith('image/')&&!type.startsWith('image/'))throw Error('Public image has wrong content type: '+type);
 results.push({key:asset.key,url,bytes:data.length,sha256:asset.sha256,contentType:type,anonymousGet:true});
}
console.log(JSON.stringify({mode,canonicalBaseUrl:base,verified:true,assets:results},null,2));
