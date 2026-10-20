/** Optional outer-shadow adapter. Geometry stays in g3-corners.mjs.
 * This computes a local correction to a live native CSS shadow, NOT a full replacement.
 * Caller supplies equally sized, padded alpha masks at its chosen render scale.
 * Supports one non-inset, zero-spread shadow; sigma is explicit, in mask pixels.
 */
function checkArray(a,n){if(a.length!==n)throw Error('Mask dimensions do not match');for(const x of a)if(!Number.isFinite(x)||x<0||x>1)throw Error('Expected alpha in [0,1]');}
function checkSize(w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w*h>32_000_000)throw Error('Invalid mask size');}
export function gaussianBlur(mask,width,height,sigma){
 checkSize(width,height);checkArray(mask,width*height);if(!Number.isFinite(sigma)||sigma<0||sigma>256)throw Error('Invalid sigma');if(sigma===0)return Float32Array.from(mask);
 const radius=Math.ceil(4*sigma),kernel=new Float64Array(2*radius+1);let sum=0;
 for(let k=-radius;k<=radius;k++){const v=Math.exp(-k*k/(2*sigma*sigma));kernel[k+radius]=v;sum+=v;}for(let k=0;k<kernel.length;k++)kernel[k]/=sum;
 const temp=new Float32Array(mask.length),out=new Float32Array(mask.length);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){let v=0;for(let k=-radius;k<=radius;k++)if(x+k>=0&&x+k<width)v+=mask[y*width+x+k]*kernel[k+radius];temp[y*width+x]=v;}
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){let v=0;for(let k=-radius;k<=radius;k++)if(y+k>=0&&y+k<height)v+=temp[(y+k)*width+x]*kernel[k+radius];out[y*width+x]=v;}
 return out;
}
export function estimateOuterShadow(mask,width,height,{sigma,offsetX=0,offsetY=0,opacity=1}){
 if(![offsetX,offsetY,opacity].every(Number.isFinite)||opacity<0||opacity>1)throw Error('Invalid shadow parameters');
 const blurred=gaussianBlur(mask,width,height,sigma),out=new Float32Array(mask.length);
 const at=(x,y)=>x>=0&&x<width&&y>=0&&y<height?blurred[y*width+x]:0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const xx=x-offsetX,yy=y-offsetY,x0=Math.floor(xx),y0=Math.floor(yy),u=xx-x0,v=yy-y0;
  out[y*width+x]=((1-v)*((1-u)*at(x0,y0)+u*at(x0+1,y0))+v*((1-u)*at(x0,y0+1)+u*at(x0+1,y0+1)))*opacity*(1-mask[y*width+x]);
 }return out;
}
/** For estimated original B and target T:
 * multiply the live native shadow by attenuation, then source-over addition
 * with the SAME RGB color. B*m + A*(1-B*m) = T (up to float rounding).
 */
export function compensation(original,target){
 checkArray(original,original.length);checkArray(target,original.length);
 const attenuation=new Float32Array(original.length),addition=new Float32Array(original.length);
 for(let i=0;i<original.length;i++){const b=original[i],t=target[i];attenuation[i]=t<b?t/b:1;addition[i]=t>b?(t-b)/(1-b):0;}
 return {attenuation,addition};
}
export function buildShadowCorrection(ordinaryMask,g3Mask,width,height,parameters){
 const original=estimateOuterShadow(ordinaryMask,width,height,parameters),target=estimateOuterShadow(g3Mask,width,height,parameters);
 return {...compensation(original,target),originalEstimate:original,targetEstimate:target,width,height};
}
/** Explicit browser profile conversion, NOT a universal CSS opacity rule.
 * Validated only for this skill's Chromium 8-bit sRGB test cases. */
export function quantizeOpacity8bit(opacity){if(!Number.isFinite(opacity)||opacity<0||opacity>1)throw Error('Invalid opacity');return Math.round(opacity*255)/255;}
