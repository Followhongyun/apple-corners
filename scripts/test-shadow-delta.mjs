import assert from 'node:assert/strict';
import {compensation,buildShadowCorrection,quantizeOpacity8bit} from './shadow-delta.mjs';
let state=67;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/2**32);
const b=Float32Array.from({length:10000},random),t=Float32Array.from({length:10000},random);b[0]=1;t[0]=0;b[1]=0;t[1]=1;
const {attenuation:m,addition:a}=compensation(b,t);let maxError=0;
for(let i=0;i<b.length;i++)maxError=Math.max(maxError,Math.abs(b[i]*m[i]+a[i]*(1-b[i]*m[i])-t[i]));assert(maxError<1e-7);
const identity=compensation(b,b);assert(identity.attenuation.every(x=>x===1));assert(identity.addition.every(x=>x===0));
const w=80,h=80,ordinary=new Float32Array(w*h),g3=new Float32Array(w*h);
for(let y=20;y<60;y++)for(let x=20;x<60;x++)ordinary[y*w+x]=g3[y*w+x]=1;
for(let y=20;y<24;y++)for(let x=20;x<24;x++)g3[y*w+x]=0;
const before=ordinary.slice(),result=buildShadowCorrection(ordinary,g3,w,h,{sigma:2,offsetX:.5,offsetY:2,opacity:.2});assert.deepEqual(before,ordinary);assert(result.attenuation.some(x=>x<1));assert(result.addition.some(x=>x>0));
// Far from changed geometry the correction must be an identity, not a full-image refit.
for(let y=0;y<h;y++)for(let x=45;x<w;x++){const i=y*w+x;assert.equal(result.attenuation[i],1);assert.equal(result.addition[i],0);}
assert.equal(quantizeOpacity8bit(.08),20/255);assert.throws(()=>compensation([NaN],[0]));assert.throws(()=>buildShadowCorrection([1],[1],1,1,{sigma:-1}));
console.log(JSON.stringify({compositingCases:10000,maxCompositionError:maxError,identityExact:true,correctionLocal:true,sourceMasksUnchanged:true},null,2));
