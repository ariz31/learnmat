export const DEFAULTS=Object.freeze({length:12,thickness:4,widthOutOfPlane:1,hydraulicConductivity:2e-5,upstreamHead:8,downstreamHead:3});
export function validateSeepageParameters(values){
 const p={...DEFAULTS,...values};
 for(const [name,value] of Object.entries(p))if(!Number.isFinite(value))throw new TypeError(name+' must be finite.');
 if(p.length<=0||p.thickness<=0||p.widthOutOfPlane<=0||p.hydraulicConductivity<=0)throw new RangeError('length, thickness, widthOutOfPlane, and hydraulicConductivity must be greater than zero.');
 return p;
}
export function computeSeepage(values={}){
 const p=validateSeepageParameters(values);
 const headDrop=p.upstreamHead-p.downstreamHead;
 const hydraulicGradient=headDrop/p.length;
 const darcyFlux=p.hydraulicConductivity*hydraulicGradient;
 const area=p.thickness*p.widthOutOfPlane;
 const discharge=darcyFlux*area;
 const direction=discharge===0?0:Math.sign(discharge);
 const headAt=x=>{
  if(!Number.isFinite(x)||x<0||x>p.length)throw new RangeError('x must lie between 0 and length.');
  return p.upstreamHead-hydraulicGradient*x;
 };
 return{parameters:p,headDrop,hydraulicGradient,darcyFlux,area,discharge,direction,headAtMidpoint:headAt(p.length/2)};
}
