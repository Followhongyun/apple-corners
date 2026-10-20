import assert from 'node:assert/strict';
import {jet,point,geometry,rasterize,makeField,PROFILE,CAP_POINTS,controls,COMPACT} from './g3-corners.mjs';
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
function curvature(t,cp){const [,v,a,j]=jet(t,cp),q=v[0]**2+v[1]**2;assert(q>0);return [cross(v,a)/q**1.5,cross(v,j)/q**2-3*cross(v,a)*(v[0]*a[0]+v[1]*a[1])/q**3];}
let profiles=0;
for(let i=0;i<=100;i++){
 const cp=controls(Object.fromEntries(['a','b','c'].map(k=>[k,COMPACT[k]+i/100*(PROFILE[k]-COMPACT[k])])));
 for(const t of [0,1])assert(curvature(t,cp).every(x=>Math.abs(x)<1e-12));
 for(let j=0;j<=100;j++){const [,v]=jet(j/100,cp);assert(v[0]+v[1]>0);assert(curvature(j/100,cp)[0]>=-1e-10);}profiles++;
}
for(const t of [0,1])assert(curvature(t,CAP_POINTS).every(x=>Math.abs(x)<1e-12));
assert(point(.5,CAP_POINTS).every(x=>Math.abs(x-1)<1e-14));
for(let i=0;i<=1000;i++)assert(curvature(i/1000,CAP_POINTS)[0]>=-1e-10);
assert(curvature(.5,CAP_POINTS)[0]>0);
assert.equal(geometry(300,60,9999).kind,'capsule');assert.equal(geometry(60,300,9999).kind,'capsule');
assert.equal(geometry(300,60,'50%').kind,'ellipse');assert.equal(geometry(60,60,9999).kind,'ellipse');
assert.deepEqual(geometry(200,100,'20% 10% / 30% 40%').usedRadii,[[40,30],[20,40],[40,30],[20,40]]);
assert.deepEqual(geometry(100,60,100).usedRadii,[[30,30],[30,30],[30,30],[30,30]]);
let seed=27;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
let cases=0,maxResidual=0;
const inputs=[[280,210,40],[300,60,9999],[60,300,9999],[300,60,'50%'],[120,120,58],[200,100,'30%'],[200,100,'40% 20% / 30% 45%'],[200,100,{tl:0,tr:50,br:[30,10],bl:8}]];
for(let i=0;i<150;i++)inputs.push([20+rnd()*500,20+rnd()*500,Object.fromEntries(['tl','tr','br','bl'].map(k=>[k,[1+rnd()*300,1+rnd()*300]]))]);
for(const [w,h,r] of inputs){
 const before=JSON.stringify(r),g=geometry(w,h,r),f=makeField(g);assert.equal(JSON.stringify(r),before);assert.equal(g.width,w);assert.equal(g.height,h);
 const [a,b,c,d]=g.cornerExtents;assert(a[0]+b[0]<=w+1e-8&&d[0]+c[0]<=w+1e-8&&a[1]+d[1]<=h+1e-8&&b[1]+c[1]<=h+1e-8);
 const check=(x,y)=>{const residual=Math.abs(f(x,y));maxResidual=Math.max(maxResidual,residual);assert(residual<1e-6,`${g.kind}: ${residual}`);};
 for(let i=0;i<=60;i++){
  const t=i/60;
  if(g.kind==='ellipse')check(w/2*(1+Math.cos(t*2*Math.PI)),h/2*(1+Math.sin(t*2*Math.PI)));
  else if(g.kind==='capsule'){const [x,y]=point(t,CAP_POINTS),R=Math.min(w,h)/2;if(w>h){check(w-R+R*x,R*y);check(R-R*x,R*y);}else{check(R*y,h-R+R*x);check(R*y,R-R*x);}}
  else {const [x,y]=point(t,g.controlPoints);for(let k=0;k<4;k++){const [ex,ey]=g.cornerExtents[k];if(ex===0||ey===0)continue;const affine=g.controlPoints.map(([x,y])=>[x*ex,y*ey]);for(const end of [0,1])assert(curvature(end,affine).every(v=>Math.abs(v)<1e-8));check(...[[ex-ex*x,ey*y],[w-ex+ex*x,ey*y],[w-ex+ex*x,h-ey*y],[ex-ex*x,h-ey*y]][k]);}}
 }cases++;
}
assert.deepEqual(geometry(100,100,{tl:[0,200],bl:50,tr:10,br:10}).usedRadii,[[0,0],[4,4],[4,4],[20,20]]);
assert.equal(geometry(100,100,0).closedBoundaryG3,false);assert.throws(()=>geometry(100,100,-1));assert.throws(()=>geometry(0,100,4));
const mask=rasterize(280,210,40,1);assert.equal(mask.data[3],0);assert.equal(mask.data[(105*280+140)*4+3],255);
console.log(JSON.stringify({profilesTested:profiles,geometryCases:cases,maxBoundaryResidualPt:maxResidual,capEndpointKappaAndArcDerivative:[curvature(0,CAP_POINTS),curvature(1,CAP_POINTS)],sourceParametersPreserved:true},null,2));
