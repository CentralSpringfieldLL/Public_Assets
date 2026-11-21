import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(root,'public');
const manifest=JSON.parse(fs.readFileSync(path.join(publicDir,'assets-manifest.json'),'utf8'));
if(manifest.version!==1||!Array.isArray(manifest.assets))throw Error('Invalid manifest');
const seen=new Set();
for(const asset of manifest.assets){
 if(!/^(newsletters\/\d{4}-\d{2}-\d{2}|documents)\/[a-z0-9/._-]+$/.test(asset.key)||asset.key.includes('..')||seen.has(asset.key))throw Error('Invalid or duplicate asset path');
 seen.add(asset.key);
 const data=fs.readFileSync(path.join(publicDir,...asset.key.split('/')));
 if(data.length!==asset.bytes||crypto.createHash('sha256').update(data).digest('hex')!==asset.sha256)throw Error('Asset content does not match manifest: '+asset.key);
 if(data.length>25*1024*1024)throw Error('Pages per-file limit exceeded');
 if(asset.key.startsWith('newsletters/')&&asset.contentType.startsWith('image/')&&data.length>=1000000)throw Error('Newsletter image size limit exceeded');
}
let files=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Symlinks are not allowed in public assets');if(entry.isDirectory())walk(p);else{files++;if(entry.name.startsWith('.env')||/\.(pem|key)$/i.test(entry.name))throw Error('Private credential file in public output');}}}
walk(publicDir);if(files>20000)throw Error('Pages free-tier file count exceeded');
if(!fs.existsSync(path.join(publicDir,'404.html')))throw Error('Missing static 404 page');
console.log(JSON.stringify({valid:true,assets:manifest.assets.length,publicFiles:files}));
