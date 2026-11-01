const http=require('http');
const fs=require('fs');
const path=require('path');
const root=path.resolve(process.argv[2] || process.cwd());
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.ico':'image/x-icon'};
http.createServer((req,res)=>{
 let reqPath=decodeURIComponent(req.url.split('?')[0]);
 if(reqPath==='/'||reqPath==='') reqPath='/index.html';
 const filePath=path.normalize(path.join(root, reqPath));
 if(!filePath.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}
 fs.readFile(filePath,(err,data)=>{
   if(err){res.writeHead(404);res.end('Not found');return;}
   res.writeHead(200,{'Content-Type':mime[path.extname(filePath).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
   res.end(data);
 });
}).listen(8080,'127.0.0.1',()=>console.log('preview-server-ready'));
