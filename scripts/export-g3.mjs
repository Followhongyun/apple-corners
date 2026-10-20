import {rasterize,geometry} from './g3-corners.mjs';
import {writeFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
const [w,h,r,s=2,file='g3-mask.png']=process.argv.slice(2);const W=Number(w),H=Number(h),R=r?.trim().startsWith('{')?JSON.parse(r):Number.isFinite(Number(r))?Number(r):r,S=Number(s);
if(!w||!h||!r){console.error('Usage: node export-g3.mjs WIDTH HEIGHT RADIUS SCALE output.png');process.exit(1);}
const result=rasterize(W,H,R,S);
function crc32(buf){let c=0xffffffff;for(const byte of buf){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc]);}
const header=Buffer.alloc(13);header.writeUInt32BE(result.width);header.writeUInt32BE(result.height,4);header[8]=8;header[9]=6;
const rows=Buffer.alloc((result.width*4+1)*result.height);
for(let y=0;y<result.height;y++)Buffer.from(result.data.buffer,y*result.width*4,result.width*4).copy(rows,y*(result.width*4+1)+1);
writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));
writeFileSync(file.replace(/\.png$/i,'')+'.geometry.json',JSON.stringify(geometry(W,H,R),null,2));
console.log(JSON.stringify({file,width:result.width,height:result.height,radiusScale:result.geometry.radiusScale}));
