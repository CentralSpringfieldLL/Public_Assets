import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
let group='';const files=[];
for(let i=0;i<args.length;i++){
 if(args[i]==='--group')group=args[++i]??'';
 else if(args[i]==='--file')files.push(args[++i]);
 else throw Error('Use --group newsletters/YYYY-MM-DD --file PATH [--file PATH]');
}
if(!/^(newsletters\/\d{4}-\d{2}-\d{2}|documents)(\/[a-z0-9-]+)*$/.test(group)||!files.length||files.some(f=>!f))throw Error('A valid group and at least one file are required');
const config=JSON.parse(fs.readFileSync(path.join(root,'hosting.json'),'utf8'));
const manifestPath=path.join(root,'public/assets-manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const types={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.avif':'image/avif','.pdf':'application/pdf','.txt':'text/plain','.csv':'text/csv','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
const encodeKey=key=>key.split('/').map(encodeURIComponent).join('/');
const base=config.canonicalBaseUrl?.replace(/\/$/,'');
if(base&&!/^https:\/\/[^/?#]+(?:\/[^?#]*)?$/.test(base))throw Error('canonicalBaseUrl must be a public HTTPS origin or path');
const added=[];
for(const source of files){
 const resolved=path.resolve(source),ext=path.extname(resolved).toLowerCase();
 const contentType=types[ext];if(!contentType)throw Error('Unsupported public asset type: '+ext);
 const data=fs.readFileSync(resolved);
 if(data.length>25*1024*1024)throw Error('Cloudflare Pages asset exceeds 25 MiB');
 if(group.startsWith('newsletters/')&&contentType.startsWith('image/')&&data.length>=1000000)throw Error('Prepare newsletter images below 1,000,000 bytes');
 const sha256=crypto.createHash('sha256').update(data).digest('hex');
 const stem=path.basename(resolved,ext).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 if(!stem)throw Error('Filename has no usable characters');
 const key=group+'/'+stem+'-'+sha256.slice(0,12)+ext;
 const target=path.join(root,'public',...key.split('/'));
 if(fs.existsSync(target)&&crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')!==sha256)throw Error('Refusing to overwrite a different published file');
 fs.mkdirSync(path.dirname(target),{recursive:true});if(!fs.existsSync(target))fs.writeFileSync(target,data);
 let entry=manifest.assets.find(a=>a.key===key);
 if(!entry){entry={key,sha256,bytes:data.length,contentType,githubRawUrl:'https://raw.githubusercontent.com/'+config.repository+'/'+config.productionBranch+'/public/'+encodeKey(key),cloudflareUrl:base?base+'/'+encodeKey(key):null};manifest.assets.push(entry);}
 added.push(entry);
}
manifest.assets.sort((a,b)=>a.key.localeCompare(b.key));
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({staged:true,pushed:false,cloudflareConfigured:config.setupComplete,assets:added},null,2));
